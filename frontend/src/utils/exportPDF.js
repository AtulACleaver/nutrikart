import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Generates and downloads a PDF of the current cart.
 * @param {Array} entries - Cart entries from useCart().entries
 * @param {number} totalCost - Total cart cost
 * @param {string} healthCondition - Active health filter
 */
export function exportCartPdf(entries, totalCost, healthCondition) {
	// Create a new PDF document. "p" = portrait, "mm" = millimeters, "a4" = page size.
	const doc = new jsPDF("p", "mm", "a4");

	// Title
	doc.setFontSize(18);
	doc.text("NutriKart - Cart Summary", 14, 20);

	// Health filter label
	doc.setFontSize(11);
	doc.text(`Health filter: ${healthCondition === "none" ? "None" : healthCondition}`, 14, 28);

	// Cart items table.
	// autoTable reads the head/body format and generates a styled table.
	doc.autoTable({
		startY: 34,
		head: [["Product", "Qty", "Unit price (₹)", "Subtotal (₹)"]],
		body: entries.map((e) => [
			e.product.name,
			e.quantity,
			e.product.price_per_unit,
			e.product.price_per_unit * e.quantity,
		]),
		// Footer row with total
		foot: [["Total", "", "", `₹${totalCost}`]],
		theme: "striped",
	});

	// Nutrition summary section (below the table).
	const finalY = doc.lastAutoTable.finalY + 10;
	doc.setFontSize(14);
	doc.text("Nutrition Summary", 14, finalY);

	const totals = entries.reduce(
		(acc, e) => {
			const q = e.quantity;
			acc.calories += (e.product.calories || 0) * q;
			acc.sugar += (e.product.sugar || 0) * q;
			acc.protein += (e.product.protein || 0) * q;
			acc.fiber += (e.product.fiber || 0) * q;
			return acc;
		},
		{ calories: 0, sugar: 0, protein: 0, fiber: 0 }
	);

	doc.autoTable({
		startY: finalY + 4,
		head: [["Nutrient", "Total"]],
		body: [
			["Calories", `${totals.calories} kcal`],
			["Sugar", `${totals.sugar} g`],
			["Protein", `${totals.protein} g`],
			["Fiber", `${totals.fiber} g`],
		],
		theme: "grid",
	});

	// Trigger browser download.
	doc.save("nutrikart-cart.pdf");
}