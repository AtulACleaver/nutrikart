import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
	return (
		<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
			{products.map((p) => (
				<ProductCard key={p.id} p={p} />
			))}
		</div>
	);
}