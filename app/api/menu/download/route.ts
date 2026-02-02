import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// @ts-ignore - jsPDF no tiene tipos completos
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase no está configurado' },
        { status: 503 }
      );
    }

    // Obtener categorías activas
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoriesError) {
      console.error('Error al obtener categorías:', categoriesError);
      return NextResponse.json(
        { error: 'Error al obtener las categorías' },
        { status: 500 }
      );
    }

    // Obtener todos los items disponibles
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error al obtener items:', itemsError);
      return NextResponse.json(
        { error: 'Error al obtener los items del menú' },
        { status: 500 }
      );
    }

    // Crear PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Título principal
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Restaurante Munay', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Menú', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Comida tradicional con amor', pageWidth / 2, yPosition, {
      align: 'center',
    });

    yPosition += 15;

    // Iterar sobre cada categoría
    categories.forEach((category, index) => {
      const categoryItems = items.filter(
        (item) => item.category_id === category.id
      );

      if (categoryItems.length === 0) return;

      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Nombre de la categoría
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(category.name, 14, yPosition);

      yPosition += 8;

      // Crear tabla con los items de la categoría
      const tableData = categoryItems.map((item) => {
        let name = item.name;
        if (item.is_vegetarian) name += ' 🌱';
        if (item.is_spicy) name += ' 🌶️';

        return [name, item.description || '', item.price];
      });

      doc.autoTable({
        startY: yPosition,
        head: [['Plato', 'Descripción', 'Precio']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [220, 38, 38], // color primario
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 100 },
          2: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    });

    // Footer en la última página
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Restaurante Munay - Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generar el PDF como buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Retornar como respuesta descargable
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="menu-restaurante-munay.pdf"',
      },
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
