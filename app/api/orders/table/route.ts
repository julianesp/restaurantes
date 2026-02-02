import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, items, total, timestamp, customerNotes } = body;

    // Validar datos
    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración de base de datos" },
        { status: 500 }
      );
    }

    // Generar número de orden único
    const orderNumber = `ORDER-${Date.now()}-${tableId}`;

    // Crear pedido en la tabla table_orders
    const { data: order, error: orderError } = await supabase
      .from("table_orders")
      .insert({
        order_number: orderNumber,
        table_id: tableId.toString(),
        total: parseFloat(total),
        status: "pending",
        customer_notes: customerNotes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Error al crear el pedido", details: orderError.message },
        { status: 500 }
      );
    }

    // Crear los items del pedido
    const orderItems = items.map((item: any) => {
      const price = parseFloat(item.price.replace(/[$.,]/g, "")) || 0;
      return {
        order_id: order.id,
        item_id: item.id.toString(),
        item_name: item.name,
        item_description: item.description || "",
        item_price: item.price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from("table_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Si falla la creación de items, eliminar el pedido
      await supabase.from("table_orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Error al crear los items del pedido", details: itemsError.message },
        { status: 500 }
      );
    }

    // Obtener el pedido completo con sus items
    const { data: fullOrder } = await supabase
      .from("table_orders")
      .select(`
        *,
        items:table_order_items(*)
      `)
      .eq("id", order.id)
      .single();

    return NextResponse.json(
      { success: true, order: fullOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Error al procesar el pedido" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración de base de datos" },
        { status: 500 }
      );
    }

    // Consultar pedido específico por ID
    if (orderId) {
      const { data: order, error } = await supabase
        .from("table_orders")
        .select(`
          *,
          items:table_order_items(*)
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
          { error: "Error al obtener el pedido" },
          { status: 500 }
        );
      }

      return NextResponse.json(order);
    }

    // Construir query
    let query = supabase
      .from("table_orders")
      .select(`
        *,
        items:table_order_items(*)
      `)
      .order("created_at", { ascending: false });

    // Filtrar por mesa si se especifica
    if (tableId) {
      query = query.eq("table_id", tableId);
    }

    // Filtrar por estado si se especifica
    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Error al obtener pedidos" },
        { status: 500 }
      );
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}

// PATCH para actualizar el estado de un pedido
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, customerNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "ID de pedido requerido" },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Error de configuración de base de datos" },
        { status: 500 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (customerNotes !== undefined) updateData.customer_notes = customerNotes;

    const { data: order, error } = await supabase
      .from("table_orders")
      .update(updateData)
      .eq("id", orderId)
      .select(`
        *,
        items:table_order_items(*)
      `)
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Error al actualizar el pedido" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
