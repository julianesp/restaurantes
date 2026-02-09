import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Endpoint de prueba para verificar la configuración
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar que supabase esté configurado
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase no está configurado',
        details: 'Las variables de entorno no están disponibles',
      });
    }

    // 2. Intentar hacer una consulta simple
    const { data, error, count } = await supabase
      .from('customer_suggestions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Error al conectar con la tabla',
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'La tabla existe y es accesible',
      count: count || 0,
      supabaseConfigured: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Error al ejecutar la prueba',
      error: error.message,
      stack: error.stack,
    });
  }
}
