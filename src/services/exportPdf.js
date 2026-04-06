import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n).replace(/\u202f|\u00a0/g, ' ');
}

function formatDate() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
}

export function generateBilanPdf(assets, userEmail) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Colors ---
  const primary = [30, 64, 175];
  const darkText = [30, 41, 59];
  const mutedText = [100, 116, 139];
  const green = [5, 150, 105];
  const red = [220, 38, 38];
  const headerBg = [241, 245, 249];

  // --- Header bar ---
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PATRIMONIA', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Bilan Patrimonial', pageWidth - 14, 10, { align: 'right' });
  doc.text(formatDate(), pageWidth - 14, 16, { align: 'right' });

  // Accent line
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 24, pageWidth, 1.2, 'F');

  // --- Summary ---
  const totalValue = assets.reduce((s, a) => s + a.quantity * a.current_value, 0);
  const totalPurchase = assets.reduce((s, a) => s + a.quantity * a.purchase_price, 0);
  const gain = totalValue - totalPurchase;
  const gainPct = totalPurchase > 0 ? ((gain / totalPurchase) * 100).toFixed(1) : '0.0';
  const isPositive = gain >= 0;

  let y = 36;
  doc.setTextColor(...mutedText);
  doc.setFontSize(8);
  doc.text('TITULAIRE', 14, y);
  doc.text('PATRIMOINE TOTAL', 110, y);
  doc.text('PLUS-VALUE GLOBALE', 200, y);

  y += 6;
  doc.setTextColor(...darkText);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(userEmail, 14, y);
  doc.text(formatEur(totalValue), 110, y);

  doc.setTextColor(...(isPositive ? green : red));
  doc.text(`${isPositive ? '+' : ''}${formatEur(gain)} (${isPositive ? '+' : ''}${gainPct}%)`, 200, y);

  // Separator
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);

  // --- Table ---
  y += 6;
  doc.setTextColor(...darkText);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail des actifs', 14, y);
  y += 3;

  const tableBody = assets.map((a) => {
    const pv = (a.current_value - a.purchase_price) * a.quantity;
    const pvPct = a.purchase_price > 0
      ? ((a.current_value - a.purchase_price) / a.purchase_price * 100).toFixed(1)
      : '0.0';

    return [
      a.name,
      a.category_name,
      a.quantity.toString(),
      formatEur(a.purchase_price),
      formatEur(a.current_value),
      formatEur(a.quantity * a.current_value),
      `${pv >= 0 ? '+' : ''}${formatEur(pv)} (${pv >= 0 ? '+' : ''}${pvPct}%)`,
    ];
  });

  const totalPv = totalValue - totalPurchase;
  tableBody.push([
    { content: 'TOTAL', styles: { fontStyle: 'bold' } },
    '', '',
    formatEur(totalPurchase),
    '',
    { content: formatEur(totalValue), styles: { fontStyle: 'bold' } },
    { content: `${totalPv >= 0 ? '+' : ''}${formatEur(totalPv)}`, styles: { fontStyle: 'bold' } },
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Nom', 'Categorie', 'Qte', 'Prix d\'achat', 'Val. unitaire', 'Total', 'Plus-value']],
    body: tableBody,
    margin: { left: 14, right: 14 },
    tableWidth: pageWidth - 28,
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: darkText,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
      overflow: 'nowrap',
    },
    headStyles: {
      fillColor: headerBg,
      textColor: darkText,
      fontStyle: 'bold',
      lineColor: [203, 213, 225],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 55 },                          // Nom
      1: { cellWidth: 30 },                          // Categorie
      2: { cellWidth: 18, halign: 'right' },         // Qte
      3: { cellWidth: 38, halign: 'right' },         // Prix d'achat
      4: { cellWidth: 38, halign: 'right' },         // Val. unitaire
      5: { cellWidth: 38, halign: 'right' },         // Total
      6: { cellWidth: 52, halign: 'right' },         // Plus-value
    },
    didParseCell(data) {
      if (data.column.index === 6 && data.section === 'body') {
        const text = typeof data.cell.raw === 'object' ? data.cell.raw.content : data.cell.raw;
        if (typeof text === 'string') {
          if (text.startsWith('+')) data.cell.styles.textColor = green;
          else if (text.startsWith('-')) data.cell.styles.textColor = red;
        }
      }
    },
  });

  // --- Footer ---
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setTextColor(...mutedText);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Document genere par Patrimonia le ${formatDate()} — Ce document est fourni a titre informatif uniquement.`,
    pageWidth / 2, finalY, { align: 'center' }
  );

  doc.save(`patrimonia-bilan-${new Date().toISOString().slice(0, 10)}.pdf`);
}
