// Health condition filter chips for the Cart page.
// "none" = no filter. The other three map directly to
// the health_condition values the backend expects in POST /recommend.
const OPTIONS = [
	{ value: "none", label: "No filter" },
	{ value: "diabetic", label: "Diabetes-safe" },
	{ value: "hypertension", label: "Hypertension-safe" },
	{ value: "weight_loss", label: "Weight-loss" },
];

export default function HealthFilters({ active, onSelect }) {
	return (
		<div className="flex flex-wrap gap-2">
			{OPTIONS.map((opt) => (
				<button
					key={opt.value}
					onClick={() => onSelect(opt.value)}
					className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
						active === opt.value
							? "bg-accent text-black border-accent"
							: "bg-surface border-border text-muted hover:border-muted"
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}