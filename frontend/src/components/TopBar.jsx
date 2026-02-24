import { Link } from "react-router-dom";
import { useCart } from "../store/cartContext";

export default function TopBar({ onCartClick }) {
	const { totalItems } = useCart();

	return (
		<header className="sticky top-0 z-30 bg-surface/80 backdrop-blur border-b border-border">
			<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
				<Link to="/" className="text-lg font-bold text-accent">NutriKart</Link>
				<button onClick={onCartClick} className="relative p-2">
					<span className="text-xl">🛒</span>
					{totalItems > 0 && (
						<span className="absolute -top-1 -right-1 bg-accent text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
							{totalItems}
						</span>
					)}
				</button>
			</div>
		</header>
	);
}