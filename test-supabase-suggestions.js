// Script para verificar si la tabla customer_suggestions existe en Supabase
// Ejecutar con: node test-supabase-suggestions.js

const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Verificando configuración de Supabase ===\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'No encontrada');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Configurada' : 'No encontrada');
  process.exit(1);
}

console.log('✅ Variables de entorno encontradas');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable() {
  try {
    console.log('Intentando consultar la tabla customer_suggestions...\n');

    // Intentar contar registros
    const { data, error, count } = await supabase
      .from('customer_suggestions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error al acceder a la tabla:');
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      console.error('Detalles:', error.details);
      console.error('Hint:', error.hint);
      console.error('\n⚠️  La tabla probablemente no existe. Ejecuta el archivo supabase-suggestions-schema.sql en Supabase SQL Editor.\n');
      process.exit(1);
    }

    console.log('✅ ¡La tabla existe y es accesible!');
    console.log('Número de registros:', count || 0);
    console.log('\n✨ Todo está configurado correctamente.\n');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

testTable();
