import ScoreBadge from "./ScoreBadge";
import { useCart } from "../store/cartContext";

// Renders the list of recommended products from POST /recommend.
// Each item shows image, name, category, price, score badge, and an Add button.
export default function RecommendationPanel({ recommendations, loading }) {
	const { add } = useCart();

	if (loading) {
		return <p className="text-muted text-sm">Loading recommendations...</p>;
	}

	if (recommendations.length === 0) {
		return <p className="text-muted text-sm">Add items to your cart to get recommendations.</p>;
	}

	return (
		<div className="space-y-3">
			{recommendations.map((rec) => (
				<div
					key={rec.id}
					className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border"
				>
					<img
						src={rec.image_url}
						alt={rec.name}
						className="w-12 h-12 rounded-lg object-cover bg-card"
					/>
					<div className="flex-1 min-w-0">
						<div className="font-semibold text-sm truncate">{rec.name}</div>
						<div className="text-xs text-muted">
							{rec.category_name} · ₹{rec.price_per_unit}
						</div>
					</div>
					<ScoreBadge score={rec.score100} />
					<button
						onClick={() => add(rec, 1)}
						className="shrink-0 px-2 py-1 rounded-lg bg-accent text-black text-xs font-bold"
					>
						Add
					</button>
				</div>
			))}
		</div>
	);
}