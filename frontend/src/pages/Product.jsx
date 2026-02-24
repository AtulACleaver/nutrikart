import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct } from "../api/catalog";
import { useCart } from "../store/cartContext";
import NutritionTable from "../components/NutritionTable";

export default function Product() {
	// useParams() extracts the :id from the URL.
	// If the URL is /product/12, productId will be "12".
	const { id: productId } = useParams();
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);
	const { itemsById, add, setQty } = useCart();

	// Fetch product data when the component mounts or when productId changes.
	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getProduct(productId)
			.then((data) => {
				if (!cancelled) setProduct(data);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		// Cleanup function: if the user navigates away before the fetch
		// completes, we set cancelled = true so we don't update state
		// on an unmounted component (React will warn about this).
		return () => { cancelled = true; };
	}, [productId]);

	if (loading) return <div className="p-8 text-muted">Loading...</div>;
	if (!product) return <div className="p-8 text-danger">Product not found.</div>;

	// Check if this product is already in the cart to show current quantity.
	const inCart = itemsById[product.id];
	const currentQty = inCart ? inCart.quantity : 0;

	return (
		<div className="max-w-2xl mx-auto p-6">
			<Link to="/" className="text-muted text-sm mb-4 inline-block">← Back to browse</Link>
			<img
				src={product.image_url}
				alt={product.name}
				className="w-full aspect-square object-cover rounded-2xl bg-surface"
			/>
			<h1 className="mt-4 text-2xl font-bold">{product.name}</h1>
			<p className="text-muted">{product.category_name}</p>
			<p className="mt-2 text-xl font-bold text-accent">₹{product.price_per_unit}</p>

			<NutritionTable product={product} />

			{/* Quantity stepper - reads and writes cart state */}
			<div className="mt-6 flex items-center gap-4">
				{currentQty === 0 ? (
					<button
						onClick={() => add(product, 1)}
						className="w-full py-3 rounded-xl bg-accent text-black font-bold text-lg"
					>
						Add to cart
					</button>
				) : (
					<div className="flex items-center gap-4 mx-auto">
						<button
							onClick={() => setQty(product.id, currentQty - 1)}
							className="w-10 h-10 rounded-full bg-surface border border-border text-lg font-bold"
						>
							−
						</button>
						<span className="text-xl font-bold min-w-[2rem] text-center">{currentQty}</span>
						<button
							onClick={() => setQty(product.id, currentQty + 1)}
							className="w-10 h-10 rounded-full bg-accent text-black text-lg font-bold"
						>
							+
						</button>
					</div>
				)}
			</div>
		</div>
	);
}