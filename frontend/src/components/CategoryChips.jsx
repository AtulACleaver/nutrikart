export default function CategoryChips({ categories, activeId, onSelect }) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
			{/* "All" chip - resets the filter */}
			<button
				onClick={() => onSelect(null)}
				className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
					activeId === null
						? "bg-accent text-black border-accent"
						: "bg-surface border-border text-muted hover:border-muted"
				}`}
			>
				All
			</button>
			{categories.map((cat) => (
				<button
					key={cat.id}
					onClick={() => onSelect(cat.id)}
					className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
						activeId === cat.id
							? "bg-accent text-black border-accent"
							: "bg-surface border-border text-muted hover:border-muted"
					}`}
				>
					{cat.name}
				</button>
			))}
		</div>
	);
}