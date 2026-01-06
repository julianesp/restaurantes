import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  reference: string;
  type: 'reserva' | 'pedido';
  customerName: string;
  customerPhone: string;
  amount: number;
  date: string;
  // Para reservas
  fecha?: string;
  hora?: string;
  personas?: string;
  comentarios?: string;
  // Para pedidos
  tipoServicio?: string;
  direccion?: string;
  barrio?: string;
  pedido?: string;
}

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();

  // Colores del tema
  const primaryColor = '#3B82F6';
  const secondaryColor = '#10B981';

  // Header - Logo y título
  doc.setFillColor(59, 130, 246); // primary-500
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Tu Restaurante', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Factura de Pago', 105, 30, { align: 'center' });

  // Información de la factura
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const startY = 50;

  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(data.type === 'reserva' ? 'RESERVA DE MESA' : 'PEDIDO', 15, startY);

  // Referencia y fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Referencia: ${data.reference}`, 15, startY + 10);
  doc.text(`Fecha de emisión: ${new Date(data.date).toLocaleString('es-CO')}`, 15, startY + 17);

  // Estado del pago
  doc.setFillColor(16, 185, 129); // green
  doc.rect(150, startY - 5, 45, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PAGADO', 172.5, startY + 2, { align: 'center' });

  // Datos del cliente
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Datos del Cliente', 15, startY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${data.customerName}`, 15, startY + 38);
  doc.text(`Teléfono: ${data.customerPhone}`, 15, startY + 45);

  // Detalles según el tipo
  let detailsY = startY + 58;

  if (data.type === 'reserva') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalles de la Reserva', 15, detailsY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    detailsY += 8;
    doc.text(`Fecha de reserva: ${data.fecha}`, 15, detailsY);
    detailsY += 7;
    doc.text(`Hora: ${data.hora}`, 15, detailsY);
    detailsY += 7;
    doc.text(`Número de personas: ${data.personas}`, 15, detailsY);

    if (data.comentarios) {
      detailsY += 7;
      doc.text('Comentarios:', 15, detailsY);
      detailsY += 7;
      const splitComments = doc.splitTextToSize(data.comentarios, 180);
      doc.text(splitComments, 15, detailsY);
      detailsY += (splitComments.length * 7);
    }

    detailsY += 10;

    // Información adicional
    doc.setFillColor(239, 246, 255); // bg-blue-50
    doc.rect(15, detailsY, 180, 25, 'F');
    doc.setFontSize(9);
    detailsY += 8;
    doc.text('• Mesa reservada por 1 hora', 20, detailsY);
    detailsY += 6;
    doc.text('• El anticipo se descuenta del total de la cuenta', 20, detailsY);
    detailsY += 6;
    doc.text('• Por favor llega 10 minutos antes de tu hora reservada', 20, detailsY);

  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detalles del Pedido', 15, detailsY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    detailsY += 8;
    doc.text(`Tipo de servicio: ${data.tipoServicio === 'domicilio' ? 'Domicilio' : 'Recoger en local'}`, 15, detailsY);

    if (data.tipoServicio === 'domicilio') {
      detailsY += 7;
      doc.text(`Dirección: ${data.direccion}`, 15, detailsY);
      detailsY += 7;
      doc.text(`Barrio: ${data.barrio}`, 15, detailsY);
    }

    detailsY += 10;
    doc.text('Detalle del pedido:', 15, detailsY);
    detailsY += 7;
    const splitPedido = doc.splitTextToSize(data.pedido || '', 180);
    doc.text(splitPedido, 15, detailsY);
    detailsY += (splitPedido.length * 7) + 10;
  }

  // Tabla de resumen de pago
  detailsY += 10;

  autoTable(doc, {
    startY: detailsY,
    head: [['Descripción', 'Monto']],
    body: [
      [
        data.type === 'reserva' ? 'Anticipo Reserva de Mesa' : 'Total del Pedido',
        `$${data.amount.toLocaleString('es-CO')} COP`
      ],
    ],
    foot: [
      ['Total Pagado', `$${data.amount.toLocaleString('es-CO')} COP`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 12
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' }
    }
  });

  // Método de pago
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('Método de pago: Wompi (Pago Online)', 15, finalY);
  doc.text(`Estado: APROBADO`, 15, finalY + 7);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(59, 130, 246);
  doc.rect(0, pageHeight - 30, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Gracias por tu preferencia', 105, pageHeight - 18, { align: 'center' });
  doc.text('WhatsApp: +57 317 450 3604', 105, pageHeight - 12, { align: 'center' });
  doc.text('https://restaurantes-phi.vercel.app', 105, pageHeight - 6, { align: 'center' });

  return doc;
}

export function downloadInvoice(data: InvoiceData) {
  const doc = generateInvoicePDF(data);
  const fileName = `Factura-${data.reference}.pdf`;
  doc.save(fileName);
}

export function viewInvoice(data: InvoiceData) {
  const doc = generateInvoicePDF(data);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
