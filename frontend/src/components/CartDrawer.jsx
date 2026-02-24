import { useCart } from "../store/cartContext";
import { Link } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
	const { entries, totalItems, totalCost, setQty } = useCart();

	// Don't render anything if cart is empty and drawer isn't open.
	if (!open) return null;

	return (
		<>
			{/* Overlay - clicking it closes the drawer */}
			<div
				onClick={onClose}
				className="fixed inset-0 z-40 bg-black/50"
			/>
			{/* Drawer panel */}
			<div className="fixed top-0 right-0 z-50 h-full w-80 bg-surface border-l border-border shadow-soft flex flex-col">
				<div className="flex items-center justify-between p-4 border-b border-border">
					<h2 className="text-lg font-bold">Cart ({totalItems})</h2>
					<button onClick={onClose} className="text-muted text-xl">✕</button>
				</div>

				{totalItems === 0 ? (
					<p className="p-4 text-muted text-sm">Your cart is empty.</p>
				) : (
					<>
						{/* Scrollable item list */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{entries.map((e) => (
								<div key={e.product.id} className="flex items-center gap-3">
									<img
										src={e.product.image_url}
										alt={e.product.name}
										className="w-12 h-12 rounded-lg object-cover bg-card"
									/>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-semibold truncate">{e.product.name}</div>
										<div className="text-xs text-muted">x{e.quantity} · ₹{e.product.price_per_unit * e.quantity}</div>
									</div>
									<div className="flex items-center gap-1">
										<button onClick={() => setQty(e.product.id, e.quantity - 1)}
											className="w-6 h-6 rounded-full bg-card border border-border text-xs">−</button>
										<span className="text-xs w-4 text-center">{e.quantity}</span>
										<button onClick={() => setQty(e.product.id, e.quantity + 1)}
											className="w-6 h-6 rounded-full bg-card border border-border text-xs">+</button>
									</div>
								</div>
							))}
						</div>

						{/* Footer with total and CTA */}
						<div className="p-4 border-t border-border">
							<div className="flex justify-between mb-3 font-bold">
								<span>Total</span>
								<span>₹{totalCost}</span>
							</div>
							<Link
								to="/cart"
								onClick={onClose}
								className="block w-full text-center py-3 rounded-xl bg-accent text-black font-bold"
							>
								Go to Cart
							</Link>
						</div>
					</>
				)}
			</div>
		</>
	);
}