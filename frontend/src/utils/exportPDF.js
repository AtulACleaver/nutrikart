import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Safely obtain the jsPDF constructor across both ESM and CJS bundling
const JsPDF = jsPDF?.jsPDF || jsPDF;

/**
 * Formats a date into YYYY-MM-DD.
 */
export function getIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Generates and downloads an organic-styled shopping list PDF.
 * @param {Array} entries - Cart entries from useCart().entries or plan items
 * @param {number} totalCost - Total cart cost
 * @param {object|string} profileOrCondition - Profile state or condition name
 */
export function exportCartPdf(entries = [], totalCost = 0, profileOrCondition = {}) {
  const profile =
    typeof profileOrCondition === "string"
      ? { condition: profileOrCondition }
      : (profileOrCondition || {});

  const doc = new JsPDF("p", "mm", "a4");
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isoDate = getIsoDate(today);

  // Background tint (#f9f4ed)
  doc.setFillColor(249, 244, 237);
  doc.rect(0, 0, 210, 297, "F");

  // Header: Sage circle + NutriKart brand
  doc.setFillColor(86, 99, 63);
  doc.circle(20, 20, 3.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(32, 30, 29);
  doc.text("NutriKart", 26, 21.5);

  // Right-aligned date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 92, 80);
  doc.text(dateStr, 194, 21.5, { align: "right" });

  // Title: "Shopping list"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(32, 30, 29);
  doc.text("Shopping list", 16, 35);

  // Profile metadata line (sage-800 bold)
  const profileParts = [];
  if (profile.condition && profile.condition !== "none") {
    const formattedCond =
      profile.condition === "diabetic"
        ? "Diabetic-Friendly"
        : profile.condition === "hypertension"
        ? "Hypertension-Conscious"
        : profile.condition === "weight_loss"
        ? "Weight Management"
        : profile.condition;
    profileParts.push(formattedCond);
  }
  if (profile.household) {
    profileParts.push(`${profile.household} ${profile.household === 1 ? "person" : "people"}`);
  }
  if (profile.budget) {
    profileParts.push(`Budget Rs. ${profile.budget}`);
  }

  let tableStartY = 42;
  if (profileParts.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(61, 71, 43);
    doc.text(profileParts.join("  ·  "), 16, 42);
    tableStartY = 48;
  }

  // Calculate items and total safely
  let totalItemCount = 0;
  let calculatedTotal = 0;

  const tableRows = (entries || []).map((e) => {
    const prod = e.product || e || {};
    const name = prod.name || "Item";
    const qty = Number(e.quantity != null ? e.quantity : prod.quantity) || 1;
    const price = Number(prod.price_per_unit != null ? prod.price_per_unit : prod.price) || 0;
    const rowCost = price * qty;

    totalItemCount += qty;
    calculatedTotal += rowCost;

    return [
      name,
      String(qty),
      `Rs. ${rowCost.toFixed(0)}`,
    ];
  });

  const finalCost = Number(totalCost) > 0 ? Number(totalCost) : calculatedTotal;

  const tableConfig = {
    startY: tableStartY,
    margin: { left: 16, right: 16 },
    head: [["ITEM", "QTY", "PRICE"]],
    body: tableRows,
    foot: [[`Total · ${totalItemCount} items`, "", `Rs. ${finalCost.toFixed(0)}`]],
    theme: "plain",
    headStyles: {
      textColor: [100, 92, 80],
      fontSize: 9,
      fontStyle: "bold",
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      fillColor: [238, 231, 219],
    },
    styles: {
      textColor: [32, 30, 29],
      fontSize: 10,
      font: "helvetica",
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      lineColor: [220, 212, 198],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 24, halign: "center" },
      2: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    footStyles: {
      textColor: [32, 30, 29],
      fontSize: 11,
      fontStyle: "bold",
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      fillColor: [238, 231, 219],
    },
  };

  // Call autoTable safely whether attached to prototype or standalone
  if (typeof doc.autoTable === "function") {
    doc.autoTable(tableConfig);
  } else if (typeof autoTable === "function") {
    autoTable(doc, tableConfig);
  }

  // Footer: Disclaimer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 92, 80);
  doc.text(
    "Guidance only, not medical advice. Prices as listed on the export date.",
    16,
    285
  );

  const filename = `nutrikart-list-${isoDate}.pdf`;
  try {
    doc.save(filename);
  } catch (err) {
    console.warn("Direct doc.save failed, trying blob download fallback:", err);
    if (typeof window !== "undefined" && window.document) {
      const blob = doc.output("blob");
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  return filename;
}
