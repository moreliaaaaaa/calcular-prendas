import {
  calcFabricBlock,
  calcFabricPurchase,
  calcSection,
  effectivePrice,
  formatCurrency,
  formatNumber,
  inheritedPrice,
} from "./calculations.js";
import {
  fabricPurchaseDisplayName,
  sanitizeFabricBlocks,
  sanitizeFabricLabels,
  sanitizeOperationLabels,
  sanitizeSectionLabels,
} from "./store.js";

function csvValue(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csvLine(values) {
  return values.map(csvValue).join(",");
}

function fileSafeName(value, fallback = "operacion") {
  const name = String(value || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return name || fallback;
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function pageWidth(doc) {
  return doc.internal.pageSize.getWidth();
}

function pageHeight(doc) {
  return doc.internal.pageSize.getHeight();
}

function ensureSpace(doc, y, needed = 60) {
  if (y + needed <= pageHeight(doc) - 44) return y;
  doc.addPage();
  return 48;
}

function drawHeader(doc, operation) {
  doc.setFillColor(48, 74, 191);
  doc.rect(0, 0, pageWidth(doc), 54, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Morelia - cuenta detallada", 40, 34);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(operation?.name || "Operacion", pageWidth(doc) - 40, 22, {
    align: "right",
  });
  doc.text(new Date().toLocaleString(), pageWidth(doc) - 40, 38, {
    align: "right",
  });
  doc.setTextColor(22, 31, 67);
}

function drawSectionTitle(doc, text, y) {
  const nextY = ensureSpace(doc, y, 34);
  doc.setFillColor(230, 237, 255);
  doc.roundedRect(40, nextY, pageWidth(doc) - 80, 24, 6, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(35, 54, 125);
  doc.text(text || "Bloque", 52, nextY + 16);
  return nextY + 34;
}

function drawTable(doc, autoTable, options) {
  autoTable(doc, {
    theme: "grid",
    margin: { left: 40, right: 40 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 5,
      lineColor: [188, 202, 245],
      lineWidth: 0.6,
      textColor: [22, 31, 67],
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [48, 74, 191],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 255],
    },
    bodyStyles: {
      valign: "middle",
    },
    didDrawPage: () => {
      const currentPage = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(106, 118, 158);
      doc.text(`Pagina ${currentPage}`, pageWidth(doc) - 40, pageHeight(doc) - 20, {
        align: "right",
      });
    },
    ...options,
  });

  return doc.lastAutoTable.finalY + 16;
}

function sectionSummaryRows(labels, totals, user) {
  const rows = [
    [labels.totalGarments, formatNumber(totals.qty, user)],
    [labels.totalPrice, formatCurrency(totals.total, user)],
  ];

  if (totals.extra > 0) rows.push([labels.extra, formatCurrency(totals.extra, user)]);
  if (totals.advance > 0) rows.push([labels.advance, formatCurrency(totals.advance, user)]);
  if (totals.extra > 0 || totals.advance > 0) {
    rows.push([labels.balance, formatCurrency(totals.balance, user)]);
  }

  return rows;
}

function activeFabricPurchase(operation) {
  return (
    operation.fabricPurchases?.find(
      (fabricPurchase) => fabricPurchase.id === operation.activeFabricId,
    ) ||
    operation.fabricPurchases?.[0] ||
    null
  );
}

export function exportOperationCsv(operation, user = null, view = "garments") {
  const operationLabels = sanitizeOperationLabels(operation?.labels);
  const isFabricExport = view === "fabric";
  const rows = [
    ["Operacion", operation?.name || ""],
    ["Exportado", new Date().toLocaleString()],
    [],
  ];

  if (!isFabricExport) {
    rows.push(["Calculadora de prendas"]);

    operation.sections.forEach((section) => {
      const labels = sanitizeSectionLabels(section.labels);
      const fallbackPrice = inheritedPrice(section.rows);
      const totals = calcSection(section.rows, section.advance, section.extra);

      rows.push([]);
      rows.push(["Bloque", section.label]);
      rows.push(["Talla", labels.qty, "Precio", "Subtotal"]);

      section.rows.forEach((row) => {
        const price = effectivePrice(row, fallbackPrice);
        rows.push([
          row.size,
          formatNumber(row.qty, user),
          formatCurrency(price, user),
          formatCurrency(row.qty * price, user),
        ]);
      });

      rows.push([labels.totalGarments, formatNumber(totals.qty, user)]);
      rows.push([labels.totalPrice, formatCurrency(totals.total, user)]);
      if (totals.extra > 0) rows.push([labels.extra, formatCurrency(totals.extra, user)]);
      if (totals.advance > 0) rows.push([labels.advance, formatCurrency(totals.advance, user)]);
      if (totals.extra > 0 || totals.advance > 0) {
        rows.push([labels.balance, formatCurrency(totals.balance, user)]);
      }
    });

    const grand = operation.sections.reduce(
      (acc, section) => {
        const totals = calcSection(section.rows, section.advance, section.extra);
        acc.qty += totals.qty;
        acc.total += totals.total;
        acc.extra += totals.extra;
        acc.advance += totals.advance;
        acc.balance += totals.balance;
        return acc;
      },
      { qty: 0, total: 0, extra: 0, advance: 0, balance: 0 },
    );

    rows.push([]);
    rows.push([operationLabels.sumTotal, formatCurrency(grand.total, user)]);
    if (grand.extra > 0) rows.push([operationLabels.extraTotal, formatCurrency(grand.extra, user)]);
    if (grand.advance > 0) {
      rows.push([operationLabels.advanceTotal, formatCurrency(grand.advance, user)]);
    }
    if (grand.extra > 0 || grand.advance > 0) {
      rows.push([operationLabels.balanceTotal, formatCurrency(grand.balance, user)]);
    }
    rows.push([operationLabels.totalGarments, formatNumber(grand.qty, user)]);
  }

  if (isFabricExport) {
    const fabricPurchase = activeFabricPurchase(operation);
    if (!fabricPurchase) return;

    const blocks = sanitizeFabricBlocks(fabricPurchase);
    const labels = sanitizeFabricLabels(fabricPurchase.labels);
    const fabricTotals = calcFabricPurchase(blocks);

    rows.push(["Compra de telas"]);
    rows.push([]);
    rows.push(["Compra", fabricPurchaseDisplayName(fabricPurchase)]);

    blocks.forEach((block) => {
      const blockTotals = calcFabricBlock(block);

      rows.push(["Bloque", block.title]);
      rows.push([
        labels.rolls,
        labels.kgPerRoll,
        labels.pricePerKg,
        "Kilos",
        labels.totalPrice,
      ]);

      block.rows.forEach((row) => {
        const kilos = row.rolls * row.kgPerRoll;
        rows.push([
          formatNumber(row.rolls, user),
          formatNumber(row.kgPerRoll, user),
          formatCurrency(row.pricePerKg, user),
          formatNumber(kilos, user),
          formatCurrency(kilos * row.pricePerKg, user),
        ]);
      });

      rows.push([labels.totalRolls, formatNumber(blockTotals.totalRolls, user)]);
      rows.push([labels.totalPrice, formatCurrency(blockTotals.totalCost, user)]);
    });

    rows.push([labels.grandTotalRolls, formatNumber(fabricTotals.totalRolls, user)]);
    rows.push([labels.grandTotalKg, formatNumber(fabricTotals.totalKg, user)]);
    rows.push([labels.grandTotalCost, formatCurrency(fabricTotals.totalCost, user)]);
  }

  const csv = `\uFEFF${rows.map(csvLine).join("\r\n")}`;
  const suffix = isFabricExport ? "telas" : "prendas";
  const filename = `${fileSafeName(`${operation?.name || "operacion"}-${suffix}`)}.csv`;

  downloadTextFile(filename, csv, "text/csv;charset=utf-8");
}

export async function exportOperationPdf(operation, user = null, view = "garments") {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default || autoTableModule.autoTable;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const operationLabels = sanitizeOperationLabels(operation?.labels);
  const isFabricExport = view === "fabric";
  let y = 76;

  drawHeader(doc, operation);

  if (!isFabricExport) {
    y = drawSectionTitle(doc, "Calculadora de prendas", y);

    operation.sections.forEach((section) => {
      const labels = sanitizeSectionLabels(section.labels);
      const fallbackPrice = inheritedPrice(section.rows);
      const totals = calcSection(section.rows, section.advance, section.extra);
      const body = section.rows.map((row) => {
        const price = effectivePrice(row, fallbackPrice);
        return [
          row.size,
          formatNumber(row.qty, user),
          formatCurrency(price, user),
          formatCurrency(row.qty * price, user),
        ];
      });

      y = drawSectionTitle(doc, section.label, y);
      y = drawTable(doc, autoTable, {
        startY: y,
        head: [["Talla", labels.qty, "Precio", "Subtotal"]],
        body,
        columnStyles: {
          0: { halign: "center", cellWidth: 95 },
          1: { halign: "right", cellWidth: 95 },
          2: { halign: "right", cellWidth: 130 },
          3: { halign: "right" },
        },
      });

      y = drawTable(doc, autoTable, {
        startY: ensureSpace(doc, y, 80),
        head: [["Resumen del bloque", "Monto"]],
        body: sectionSummaryRows(labels, totals, user),
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "right", fontStyle: "bold" },
        },
      });
    });

    const grand = operation.sections.reduce(
      (acc, section) => {
        const totals = calcSection(section.rows, section.advance, section.extra);
        acc.qty += totals.qty;
        acc.total += totals.total;
        acc.extra += totals.extra;
        acc.advance += totals.advance;
        acc.balance += totals.balance;
        return acc;
      },
      { qty: 0, total: 0, extra: 0, advance: 0, balance: 0 },
    );
    const grandRows = [
      [operationLabels.sumTotal, formatCurrency(grand.total, user)],
    ];

    if (grand.extra > 0) grandRows.push([operationLabels.extraTotal, formatCurrency(grand.extra, user)]);
    if (grand.advance > 0) {
      grandRows.push([operationLabels.advanceTotal, formatCurrency(grand.advance, user)]);
    }
    if (grand.extra > 0 || grand.advance > 0) {
      grandRows.push([operationLabels.balanceTotal, formatCurrency(grand.balance, user)]);
    }
    grandRows.push([operationLabels.totalGarments, formatNumber(grand.qty, user)]);

    y = drawSectionTitle(doc, "Resumen general", y);
    y = drawTable(doc, autoTable, {
      startY: y,
      head: [["Concepto", "Total"]],
      body: grandRows,
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right", fontStyle: "bold" },
      },
    });
  }

  if (isFabricExport) {
    const fabricPurchase = activeFabricPurchase(operation);
    if (!fabricPurchase) return;

    y = drawSectionTitle(doc, "Compra de telas", y);

    const blocks = sanitizeFabricBlocks(fabricPurchase);
    const labels = sanitizeFabricLabels(fabricPurchase.labels);
    const fabricTotals = calcFabricPurchase(blocks);

    y = drawSectionTitle(doc, fabricPurchaseDisplayName(fabricPurchase), y);

    blocks.forEach((block) => {
      const blockTotals = calcFabricBlock(block);
      const body = block.rows.map((row) => {
        const kilos = row.rolls * row.kgPerRoll;
        return [
          formatNumber(row.rolls, user),
          formatNumber(row.kgPerRoll, user),
          formatCurrency(row.pricePerKg, user),
          formatNumber(kilos, user),
          formatCurrency(kilos * row.pricePerKg, user),
        ];
      });

      y = drawSectionTitle(doc, block.title, y);
      y = drawTable(doc, autoTable, {
        startY: y,
        head: [[labels.rolls, labels.kgPerRoll, labels.pricePerKg, "Kilos", labels.totalPrice]],
        body,
        columnStyles: {
          0: { halign: "right" },
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
      });
      y = drawTable(doc, autoTable, {
        startY: ensureSpace(doc, y, 70),
        head: [["Resumen del bloque", "Total"]],
        body: [
          [labels.totalRolls, formatNumber(blockTotals.totalRolls, user)],
          [labels.totalPrice, formatCurrency(blockTotals.totalCost, user)],
        ],
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "right", fontStyle: "bold" },
        },
      });
    });

    y = drawTable(doc, autoTable, {
      startY: ensureSpace(doc, y, 90),
      head: [["Resumen compra de telas", "Total"]],
      body: [
        [labels.grandTotalRolls, formatNumber(fabricTotals.totalRolls, user)],
        [labels.grandTotalKg, formatNumber(fabricTotals.totalKg, user)],
        [labels.grandTotalCost, formatCurrency(fabricTotals.totalCost, user)],
      ],
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right", fontStyle: "bold" },
      },
    });
  }

  const suffix = isFabricExport ? "telas" : "prendas";
  doc.save(`${fileSafeName(`${operation?.name || "morelia-cuenta"}-${suffix}`)}.pdf`);
}
