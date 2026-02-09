// Script para probar insertar una sugerencia
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('=== Probando inserción de sugerencia ===\n');

  try {
    const testData = {
      name: 'Test Usuario',
      email: 'test@example.com',
      phone: '1234567890',
      message: 'Este es un mensaje de prueba',
      rating: 5,
      suggestion_type: 'general',
      is_read: false,
      is_replied: false,
    };

    console.log('Datos a insertar:', testData);
    console.log('\nInsertando...\n');

    const { data, error } = await supabase
      .from('customer_suggestions')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar:');
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      console.error('Detalles:', error.details);
      console.error('Hint:', error.hint);
      console.error('\n⚠️  Problema:', error);
      process.exit(1);
    }

    console.log('✅ ¡Sugerencia insertada correctamente!');
    console.log('ID:', data.id);
    console.log('Datos:', data);
    console.log('\n✨ La funcionalidad de inserción funciona correctamente.\n');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

testInsert();
