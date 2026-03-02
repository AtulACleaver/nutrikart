import { useEffect, useState, useMemo, useCallback } from "react";
import { useCart } from "../store/cartContext";
import { getRecommendations } from "../api/recommend";
import { debounce } from "../utils/debounce";
import { Link } from "react-router-dom";
import { exportCartPdf } from "../utils/exportPDF";
import HealthFilters from "../components/HealthFilters";
import RecommendationPanel from "../components/RecommendationPanel";

export default function Cart() {
	const { entries, totalItems, totalCost, setQty, clear } = useCart();

	// User settings for the recommendation engine.
	// These live in local component state because they only matter on this page.
	const [budget, setBudget] = useState(500);
	const [householdSize, setHouseholdSize] = useState(2);
	const [healthCondition, setHealthCondition] = useState("none");
	const [recommendations, setRecommendations] = useState([]);
	const [recsLoading, setRecsLoading] = useState(false);

	// Build the API payload from current cart state.
	// useMemo ensures this only recomputes when entries change,
	// not on every render.
	const cartPayload = useMemo(
		() => entries.map((e) => ({ product_id: e.product.id, quantity: e.quantity })),
		[entries]
	);

	// Debounced fetch function. useCallback ensures the debounced function
	// is stable across renders (same reference), so the useEffect below
	// doesn't re-trigger unnecessarily.
	const fetchRecs = useCallback(
		debounce(async (payload, budget, healthCondition, householdSize) => {
			if (payload.length === 0) {
				setRecommendations([]);
				return;
			}
			setRecsLoading(true);
			try {
			const data = await getRecommendations({
					budget,
					health_condition: healthCondition === "none" ? null : healthCondition,
					household_size: householdSize,
				});
				setRecommendations(data.recommendations || []);
			} catch (err) {
				console.error("Recommendation fetch failed:", err);
			} finally {
				setRecsLoading(false);
			}
		}, 400),
		[]
	);

	// Fire recommendation fetch whenever any input changes.
	// The debounce inside fetchRecs ensures rapid changes
	// (like adjusting quantity multiple times) only trigger one API call.
	useEffect(() => {
		fetchRecs(cartPayload, budget, healthCondition, householdSize);
	}, [cartPayload, budget, healthCondition, householdSize, fetchRecs]);

	if (totalItems === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-muted text-lg">Your cart is empty.</p>
				<Link to="/" className="mt-4 inline-block text-accent font-semibold">
					← Browse products
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
			{/* LEFT COLUMN: Cart items and totals */}
			<div>
				<h1 className="text-2xl font-bold mb-4">Your cart</h1>
				{entries.map((e) => (
					<div key={e.product.id} className="flex items-center gap-4 py-3 border-b border-border">
						<img src={e.product.image_url} alt={e.product.name}
							className="w-16 h-16 rounded-lg object-cover bg-surface" />
						<div className="flex-1">
							<div className="font-semibold">{e.product.name}</div>
							<div className="text-sm text-muted">₹{e.product.price_per_unit} each</div>
						</div>
						<div className="flex items-center gap-2">
							<button onClick={() => setQty(e.product.id, e.quantity - 1)}
								className="w-8 h-8 rounded-full bg-surface border border-border">−</button>
							<span className="w-6 text-center">{e.quantity}</span>
							<button onClick={() => setQty(e.product.id, e.quantity + 1)}
								className="w-8 h-8 rounded-full bg-surface border border-border">+</button>
						</div>
						<div className="font-bold w-20 text-right">
							₹{e.product.price_per_unit * e.quantity}
						</div>
					</div>
				))}
				<div className="mt-4 flex justify-between text-lg font-bold">
					<span>Total ({totalItems} items)</span>
					<span>₹{totalCost}</span>
				</div>
				<button onClick={clear}
					className="mt-2 text-sm text-danger">Clear cart</button>

				<button
					onClick={() => exportCartPdf(entries, totalCost, healthCondition)}
					className="mt-4 w-full py-3 rounded-xl bg-accent text-black font-bold"
				>
					Export PDF
				</button>
			</div>

			{/* RIGHT COLUMN: Health filters + Recommendations */}
			<div>
				{/* Health condition filter */}
				<HealthFilters active={healthCondition} onSelect={setHealthCondition} />

				{/* Budget and household inputs */}
				<div className="flex gap-4 mb-4">
					<label className="flex-1">
						<span className="text-sm text-muted">Budget (₹)</span>
						<input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))}
							className="mt-1 w-full px-3 py-2 bg-surface border border-border rounded-lg" />
					</label>
					<label className="flex-1">
						<span className="text-sm text-muted">Household size</span>
						<input type="number" value={householdSize} onChange={(e) => setHouseholdSize(Number(e.target.value))}
							className="mt-1 w-full px-3 py-2 bg-surface border border-border rounded-lg" />
					</label>
				</div>

				{/* Recommendations panel */}
				<h2 className="text-lg font-bold mb-2">Recommendations</h2>
				<RecommendationPanel recommendations={recommendations} loading={recsLoading} />
			</div>
		</div>
	);
}