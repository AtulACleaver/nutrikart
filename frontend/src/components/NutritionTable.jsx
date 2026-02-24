// Reusable nutrition breakdown table.
// Takes a product object and renders all 8 nutrition values.
// Used on Product detail page. Can be reused on Cart page or PDF later.
export default function NutritionTable({ product }) {
	const rows = [
		["Calories", product.calories, "kcal"],
		["Sugar", product.sugar, "g"],
		["Sodium", product.sodium, "mg"],
		["Protein", product.protein, "g"],
		["Fat", product.fat, "g"],
		["Saturated fat", product.sat_fat, "g"],
		["Fiber", product.fiber, "g"],
		["Serving size", product.serving_size, "g"],
	];

	return (
		<div className="bg-surface rounded-xl p-4 border border-border">
			<h2 className="text-lg font-semibold mb-3">Nutrition per serving</h2>
			<table className="w-full text-sm">
				<tbody>
					{rows.map(([label, val, unit]) => (
						<tr key={label} className="border-b border-border last:border-0">
							<td className="py-2 text-muted">{label}</td>
							<td className="py-2 text-right font-medium">
								{val != null ? val : "—"} {unit}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}