import { useCart } from "../store/cartContext";
import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
	// Pull the add function from cart context.
	// This component only needs to ADD items - it doesn't need
	// to know about quantities or totals.
	const { add } = useCart();

	return (
		<div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
			{/* The entire card is a Link to the product detail page.
			    Clicking anywhere on the card navigates to /product/:id. */}
			<Link to={`/product/${p.id}`} className="block">
				{/* aspect-square forces 1:1 ratio regardless of image dimensions.
				    bg-surface provides a dark placeholder while the image loads.
				    object-cover ensures the image fills the square without distortion. */}
				<div className="aspect-square bg-surface">
					<img
						src={p.image_url}
						alt={p.name}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				</div>
				<div className="p-3">
					{/* Category name in muted color - secondary info */}
					<div className="text-sm text-muted">{p.category_name}</div>
					{/* line-clamp-2 truncates to 2 lines with ellipsis.
					    Without this, a product named "Organic Whole Wheat Multi-Grain
					    Stone-Ground Flour 5kg" would push the card height way past
					    its neighbors and break the grid layout. */}
					<div className="mt-1 text-[15px] leading-5 font-semibold line-clamp-2">
						{p.name}
					</div>
					<div className="mt-2 flex items-center justify-between">
						<div className="text-base font-bold">₹{p.price_per_unit}</div>
						{/* e.preventDefault() stops the Link navigation when clicking Add.
						    Without it, clicking "Add" would navigate to the product page
						    instead of adding to cart. The button is nested inside the Link,
						    so we need to stop the click from bubbling up. */}
						<button
							onClick={(e) => {
								e.preventDefault();
								add(p, 1);
							}}
							className="px-3 py-1.5 rounded-xl bg-accent text-black font-semibold"
						>
							Add
						</button>
					</div>
				</div>
			</Link>
		</div>
	);
}