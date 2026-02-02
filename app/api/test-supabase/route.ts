import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          error: "Supabase client not initialized",
          env: {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        },
        { status: 500 }
      );
    }

    // Probar conexión consultando las tablas
    const { data: tables, error: tablesError } = await supabase
      .from("restaurant_tables")
      .select("*")
      .limit(5);

    if (tablesError) {
      return NextResponse.json(
        {
          error: "Error querying tables",
          details: tablesError.message,
          code: tablesError.code
        },
        { status: 500 }
      );
    }

    // Probar consulta de pedidos
    const { data: orders, error: ordersError } = await supabase
      .from("table_orders")
      .select("*")
      .limit(5);

    if (ordersError) {
      return NextResponse.json(
        {
          error: "Error querying orders",
          details: ordersError.message,
          code: ordersError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data: {
        tables: tables,
        orders: orders
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error", details: error.message },
      { status: 500 }
    );
  }
}
