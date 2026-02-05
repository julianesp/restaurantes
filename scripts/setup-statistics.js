/**
 * Script para configurar las estadísticas en Supabase
 *
 * Ejecuta el schema SQL que crea vistas y funciones
 * para las estadísticas de platos más pedidos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStatistics() {
  try {
    console.log('🚀 Iniciando configuración de estadísticas...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase-statistics-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Archivo SQL leído correctamente');
    console.log('📊 Creando vistas y funciones...\n');

    // Dividir el SQL en comandos individuales (por punto y coma seguido de salto de línea)
    // Esto es necesario porque Supabase no ejecuta múltiples comandos a la vez
    const commands = sql
      .split(/;\s*\n/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
      .map(cmd => cmd.endsWith(';') ? cmd : cmd + ';');

    console.log(`📝 Se ejecutarán ${commands.length} comandos SQL\n`);

    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Saltar comentarios y comandos vacíos
      if (command.trim().startsWith('--') || command.trim() === ';') {
        continue;
      }

      // Obtener el nombre del comando para logging
      let commandName = 'Unknown';
      if (command.includes('CREATE OR REPLACE VIEW')) {
        commandName = 'CREATE VIEW: ' + (command.match(/VIEW\s+(\w+)/i)?.[1] || 'unknown');
      } else if (command.includes('CREATE OR REPLACE FUNCTION')) {
        commandName = 'CREATE FUNCTION: ' + (command.match(/FUNCTION\s+(\w+)/i)?.[1] || 'unknown');
      } else if (command.includes('CREATE INDEX')) {
        commandName = 'CREATE INDEX: ' + (command.match(/INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || 'unknown');
      } else if (command.includes('COMMENT ON')) {
        commandName = 'COMMENT';
      }

      try {
        process.stdout.write(`  [${i + 1}/${commands.length}] ${commandName}... `);

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });

        // Si la función exec_sql no existe, intentar con el método directo
        // (esto probablemente no funcionará con la configuración estándar de Supabase)
        if (error && error.message.includes('exec_sql')) {
          console.log('⚠️  Método RPC no disponible');
          console.log('\n⚠️  IMPORTANTE: Debes ejecutar el SQL manualmente en Supabase');
          console.log('📝 Instrucciones:');
          console.log('   1. Ve a https://app.supabase.com/project/_/sql/new');
          console.log('   2. Copia el contenido de supabase-statistics-schema.sql');
          console.log('   3. Pégalo en el editor SQL');
          console.log('   4. Haz clic en "Run"\n');
          process.exit(1);
        } else if (error) {
          console.log('❌ Error');
          console.error(`     Error: ${error.message}\n`);
        } else {
          console.log('✅ OK');
        }
      } catch (err) {
        console.log('❌ Error');
        console.error(`     Error: ${err.message}\n`);
      }
    }

    console.log('\n✅ Configuración completada!\n');
    console.log('📊 Estadísticas disponibles:');
    console.log('   - Vista: item_statistics');
    console.log('   - Función: get_item_statistics(time_filter)');
    console.log('   - Función: get_top_items(time_filter, limit_count)');
    console.log('   - Función: get_sales_summary(time_filter)\n');
    console.log('🔍 Índices creados para mejorar performance\n');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupStatistics();
