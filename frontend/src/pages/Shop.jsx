import React, { useEffect, useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, ImageOff } from "lucide-react";
import { getCategories, getProducts } from "../api/catalog";
import AppLayout from "../components/AppLayout";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";
import { useProfile } from "../store/ProfileContext";
import { EmptyState, Button, Skeleton } from "../components/ui";

export default function Shop() {
  const { profile, setShowAll, evaluateProduct } = useProfile();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, [reloadKey]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = activeCategory ? { categoryId: activeCategory } : {};
    getProducts(params)
      .then(setProducts)
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCategory, reloadKey]);

  // Profile-based evaluation counts
  const evaluationStats = useMemo(() => {
    if (!profile.condition) return null;

    let fit = 0;
    let misfit = 0;
    let unknown = 0;

    for (const p of products) {
      const res = evaluateProduct(p);
      if (res.fits) fit++;
      else if (res.isUnknown) unknown++;
      else misfit++;
    }

    return { fit, misfit, unknown };
  }, [products, profile.condition, evaluateProduct]);

  // Filtered products composition (Search + Category + Profile fit)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      // 1. Search filter
      if (q) {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category_name?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !brandMatch) return false;
      }

      // 2. Profile condition filter (unless showAll is toggled)
      if (profile.condition && !profile.showAll) {
        const res = evaluateProduct(p);
        if (!res.fits) return false;
      }

      return true;
    });
  }, [products, searchQuery, profile.condition, profile.showAll, evaluateProduct]);

  return (
    <AppLayout onCartClick={() => setDrawerOpen(true)}>
      <div className="py-6 md:py-8 flex flex-col gap-6">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Caprasimo',serif] text-[32px] md:text-[38px] text-[var(--color-ink,#201e1d)] leading-tight">
              Grocery Catalogue
            </h1>
            <p className="text-[14px] text-[var(--color-neutral-700,#645c50)]">
              Explore verified nutritional data and real local grocery offerings.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-[320px]">
            <Search
              size={18}
              strokeWidth={2.75}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-600,#82796a)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search food or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[48px] pl-11 pr-10 rounded-full bg-[var(--color-surface,#ebddc5)] text-[14px] font-medium text-[var(--color-ink,#201e1d)] placeholder:text-[var(--color-neutral-600,#82796a)] border border-[var(--color-divider)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)] cursor-pointer"
              >
                <X size={15} strokeWidth={2.75} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Filter Status Banner */}
        {profile.condition && evaluationStats && (
          <div className="p-4 rounded-2xl bg-[var(--color-sage-100,#f0fae1)] border border-[var(--color-sage-300,#ccdbb2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14px]">
            <div className="flex items-center gap-2 flex-wrap text-[var(--color-sage-900,#272e1b)]">
              <span className="font-bold">
                Filtered by {profile.condition === "diabetic" ? "Diabetic-Friendly" : profile.condition === "hypertension" ? "Hypertension-Conscious" : "Weight Management"}:
              </span>
              <span>
                <strong>{evaluationStats.fit}</strong> verified fits • <strong>{evaluationStats.misfit}</strong> outside limits • <strong>{evaluationStats.unknown}</strong> unknown
              </span>
            </div>

            <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-sage-900,#272e1b)] cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={profile.showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="accent-[var(--color-sage-700,#56633f)] w-4 h-4 cursor-pointer"
              />
              <span>Show everything</span>
            </label>
          </div>
        )}

        {/* Category Chips */}
        <CategoryChips
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 mt-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <Skeleton height="180px" radius="rounded-[28px]" />
                <Skeleton height="20px" radius="rounded-md" width="70%" />
                <Skeleton height="24px" radius="rounded-md" width="40%" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <EmptyState
              tone="terracotta"
              title="Could not connect to catalogue"
              body="We were unable to load groceries from the NutriKart API. Please check your connection."
              primaryAction={
                <Button variant="plan" size="md" onClick={() => setReloadKey((k) => k + 1)}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              tone="neutral"
              title="No products found"
              body={
                searchQuery
                  ? `No groceries matched "${searchQuery}". Try a different search term or reset filters.`
                  : "No products in this category meet your active dietary limits. You can toggle 'Show everything' to view all catalogue items."
              }
              primaryAction={
                searchQuery ? (
                  <Button variant="secondary" size="md" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                ) : (
                  <Button variant="plan" size="md" onClick={() => setShowAll(true)}>
                    Show all items
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </AppLayout>
  );
}
