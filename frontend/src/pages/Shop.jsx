import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../api/catalog";
import AppLayout from "../components/AppLayout";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";

export default function Shop() {
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [activeCategory, setActiveCategory] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [slow, setSlow] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const [drawerOpen, setDrawerOpen] = useState(false);

	// Fetch categories once on mount.
	useEffect(() => {
		getCategories().then(setCategories).catch(console.error);
	}, [reloadKey]);

	// Fetch products whenever the active category changes.
	// null = all products, a number = filtered by that category.
	useEffect(() => {
		setLoading(true);
		setError(null);
		setSlow(false);

		const timer = setTimeout(() => {
			setSlow(true);
		}, 3000);

		const params = activeCategory ? { categoryId: activeCategory } : {};
		getProducts(params)
			.then(setProducts)
			.catch((err) => {
				console.error(err);
				setError(err);
			})
			.finally(() => {
				clearTimeout(timer);
				setLoading(false);
			});

		return () => {
			clearTimeout(timer);
		};
	}, [activeCategory, reloadKey]);

	return (
		<AppLayout onCartClick={() => setDrawerOpen(true)}>
			<div className="pt-4">
				<CategoryChips
					categories={categories}
					activeId={activeCategory}
					onSelect={setActiveCategory}
				/>
				{loading ? (
					slow ? (
						<p className="mt-8 text-center text-[var(--color-neutral-700,#645c50)]">
							Waking up the server (free hosting sleeps when idle). This can take up to a minute...
						</p>
					) : (
						<p className="mt-8 text-center text-[var(--color-neutral-700,#645c50)]">Loading products...</p>
					)
				) : error ? (
					<div className="mt-8 text-center">
						<p className="text-[var(--color-terracotta-700,#8c491a)] mb-4">Could not reach the NutriKart API.</p>
						<button
							onClick={() => setReloadKey((k) => k + 1)}
							className="px-5 py-2.5 rounded-full bg-[var(--color-sage-700,#56633f)] text-white font-semibold cursor-pointer"
						>
							Try again
						</button>
					</div>
				) : products.length === 0 ? (
					<p className="mt-8 text-center text-[var(--color-neutral-700,#645c50)]">No products found.</p>
				) : (
					<ProductGrid products={products} />
				)}
			</div>
			<CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
		</AppLayout>
	);
}
