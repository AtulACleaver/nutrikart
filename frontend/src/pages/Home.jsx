import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../api/catalog";
import TopBar from "../components/TopBar";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";

export default function Home() {
	const [categories, setCategories] = useState([]);
	const [products, setProducts] = useState([]);
	const [activeCategory, setActiveCategory] = useState(null);
	const [loading, setLoading] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);

	// Fetch categories once on mount.
	useEffect(() => {
		getCategories().then(setCategories).catch(console.error);
	}, []);

	// Fetch products whenever the active category changes.
	// null = all products, a number = filtered by that category.
	useEffect(() => {
		setLoading(true);
		const params = activeCategory ? { categoryId: activeCategory } : {};
		getProducts(params)
			.then(setProducts)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [activeCategory]);

	return (
		<div className="min-h-screen bg-bg">
			<TopBar onCartClick={() => setDrawerOpen(true)} />
			<div className="max-w-6xl mx-auto px-4 pt-4">
				<CategoryChips
					categories={categories}
					activeId={activeCategory}
					onSelect={setActiveCategory}
				/>
				{loading ? (
					<p className="mt-8 text-center text-muted">Loading products...</p>
				) : products.length === 0 ? (
					<p className="mt-8 text-center text-muted">No products found.</p>
				) : (
					<ProductGrid products={products} />
				)}
			</div>
			<CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
		</div>
	);
}