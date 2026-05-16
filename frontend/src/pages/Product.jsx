import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBasket,
  ImageOff,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getProduct } from "../api/catalog";
import { useCart } from "../store/cartContext";
import { useProfile } from "../store/ProfileContext";
import NutritionTable from "../components/NutritionTable";
import FitVerdict from "../components/FitVerdict";
import { ProductCard } from "../components/ProductCard";
import AppLayout from "../components/AppLayout";
import { Tag, Button, QtyStepper, Skeleton, EmptyState } from "../components/ui";
import { formatPrice } from "../utils/formatPrice";

export default function Product() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  const { itemsById, add, setQty } = useCart();
  const { profile } = useProfile();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setImgError(false);

    getProduct(productId)
      .then((data) => {
        if (cancelled) return;
        if (!data || data.detail === "Product not found" || data.id === undefined) {
          setError(true);
        } else {
          setProduct(data);
          // Fetch related items from the same category
          fetch(`/api/products?category_id=${data.category_id}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((list) => {
              if (!cancelled) {
                const others = list.filter((p) => p.id !== data.id).slice(0, 4);
                setRelatedProducts(others);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const cartEntry = product ? itemsById[product.id] : null;
  const currentQty = cartEntry ? cartEntry.quantity : 0;

  // Calculate approximate per 100g price if serving size / net weight exists
  const getPer100g = () => {
    if (!product || !product.price_per_unit) return null;
    // Check if name has grams (e.g., "500 g", "390 g", "1 kg")
    const matchKg = product.name?.match(/(\d+(?:\.\d+)?)\s*kg/i);
    const matchG = product.name?.match(/(\d+(?:\.\d+)?)\s*g/i);
    let totalGrams = null;

    if (matchKg) {
      totalGrams = parseFloat(matchKg[1]) * 1000;
    } else if (matchG) {
      totalGrams = parseFloat(matchG[1]);
    } else if (product.serving_size && product.measurement_basis === "per_serving") {
      totalGrams = product.serving_size * 5; // heuristic pack multiple
    }

    if (totalGrams && totalGrams > 0) {
      const per100gPrice = (product.price_per_unit / totalGrams) * 100;
      return `(₹${per100gPrice.toFixed(1)} / 100g)`;
    }
    return null;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-[1152px] mx-auto px-5 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton height="480px" radius="rounded-[40px]" />
            <div className="flex flex-col gap-5">
              <Skeleton height="32px" width="30%" radius="rounded-full" />
              <Skeleton height="44px" width="80%" radius="rounded-lg" />
              <Skeleton height="36px" width="40%" radius="rounded-lg" />
              <Skeleton height="120px" radius="rounded-[28px]" />
              <Skeleton height="200px" radius="rounded-[28px]" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="max-w-[1152px] mx-auto px-5 md:px-8 py-20 text-center">
          <EmptyState
            tone="terracotta"
            title="Product not found"
            body="We couldn't locate this grocery item. It may have been removed or discontinued from the catalogue."
            primaryAction={
              <Button variant="plan" size="md" onClick={() => navigate("/shop")}>
                Back to catalogue
              </Button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const per100gText = getPer100g();

  return (
    <AppLayout>
      <div className="max-w-[1152px] mx-auto px-5 md:px-8 py-6 md:py-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-neutral-700,#645c50)] mb-6"
        >
          <Link
            to="/shop"
            className="hover:text-[var(--color-terracotta-700,#8c491a)] transition-colors"
          >
            Shop
          </Link>
          <span className="text-[var(--color-neutral-400,#c0b6a5)]">/</span>
          <span className="text-[var(--color-neutral-800,#4a4439)] truncate max-w-[200px]">
            {product.category_name || "Groceries"}
          </span>
          <span className="text-[var(--color-neutral-400,#c0b6a5)]">/</span>
          <span className="text-[var(--color-ink,#201e1d)] font-bold truncate max-w-[260px]">
            {product.name}
          </span>
        </nav>

        {/* Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Card */}
          <div className="relative aspect-square max-h-[520px] w-full rounded-[40px] bg-[var(--color-neutral-100,#f9f4ed)] border border-[var(--color-divider)] p-6 md:p-10 flex items-center justify-center overflow-hidden">
            {!imgError && product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-[var(--color-neutral-600,#82796a)]">
                <span className="w-16 h-16 rounded-full bg-[var(--color-neutral-200,#eee7db)] flex items-center justify-center">
                  <ImageOff size={28} strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-semibold">Photo coming soon</span>
              </div>
            )}

            {/* Verification Badge */}
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] text-[12px] font-semibold text-[var(--color-ink,#201e1d)]">
                <ShieldCheck size={14} className="text-[var(--color-sage-700,#56633f)]" />
                {product.verification_status === "verified" ? "Verified nutrition" : "Catalog baseline"}
              </span>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Tag tone="neutral">{product.category_name || "Food Item"}</Tag>
                {product.brand && (
                  <span className="text-[13px] font-semibold text-[var(--color-neutral-700,#645c50)]">
                    by {product.brand}
                  </span>
                )}
              </div>

              <h1 className="font-['Caprasimo',serif] text-[32px] md:text-[40px] text-[var(--color-ink,#201e1d)] leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-['Caprasimo',serif] text-[36px] text-[var(--color-ink,#201e1d)]">
                  {formatPrice(product.price_per_unit)}
                </span>
                {per100gText && (
                  <span className="text-[14px] font-semibold text-[var(--color-neutral-700,#645c50)]">
                    {per100gText}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Basket Action Row */}
            <div className="flex items-center gap-4">
              {currentQty === 0 ? (
                <Button
                  variant="basket"
                  size="lg"
                  className="flex-1"
                  onClick={() => add(product, 1)}
                  aria-label={`Add ${product.name} to basket`}
                >
                  <ShoppingBasket size={20} strokeWidth={2.75} />
                  Add to basket
                </Button>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <QtyStepper
                    value={currentQty}
                    onChange={(newQty) => setQty(product.id, newQty)}
                    aria-label={`Quantity of ${product.name}`}
                  />
                  <span className="text-[14px] font-bold text-[var(--color-sage-800,#3d472b)]">
                    In your basket ({formatPrice(product.price_per_unit * currentQty)})
                  </span>
                </div>
              )}
            </div>

            {/* Health Profile Fit Verdict */}
            <FitVerdict product={product} />

            {/* Nutrition Facts Table */}
            {/* Desktop: Always visible; Mobile: Accordion */}
            <div className="hidden md:block">
              <NutritionTable product={product} />
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setNutritionOpen(!nutritionOpen)}
                className="w-full p-4 rounded-2xl bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] flex items-center justify-between font-bold text-[15px] text-[var(--color-ink,#201e1d)]"
              >
                <span>Nutrition Facts</span>
                {nutritionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {nutritionOpen && (
                <div className="mt-2">
                  <NutritionTable product={product} />
                </div>
              )}
            </div>

            {/* Data Provenance & Disclosures */}
            <div className="p-4 rounded-2xl bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] text-[12px] text-[var(--color-neutral-700,#645c50)] flex flex-col gap-1.5">
              <div className="font-bold text-[var(--color-ink,#201e1d)]">
                Data Provenance & Clinical Notice
              </div>
              <div>
                Source: <strong>{product.source_type || "seed_catalogue"}</strong>
                {product.source_ref ? ` (${product.source_ref})` : ""}
              </div>
              <div>
                Nutritional metrics represent published manufacturer values or curated references. NutriKart optimizes for personal targets and does not replace medical advice.
              </div>
            </div>
          </div>
        </div>

        {/* Related Category Recommendations */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--color-divider)]">
            <h2 className="font-['Caprasimo',serif] text-[24px] md:text-[28px] text-[var(--color-ink,#201e1d)] mb-6">
              More {product.category_name || "similar items"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
