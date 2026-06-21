import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ImageOff } from "lucide-react";
import { useCart } from "../store/cartContext";
import { useProfile } from "../store/ProfileContext";
import { Tag, QtyStepper } from "./ui";
import { formatPrice } from "../utils/formatPrice";

export function ProductCard({ p }) {
  const { itemsById, add, setQty } = useCart();
  const { profile, evaluateProduct, getTags, getMisfitReason } = useProfile();
  const [imgError, setImgError] = useState(false);

  const cartEntry = itemsById[p.id];
  const qty = cartEntry ? cartEntry.quantity : 0;

  const evaluation = profile.condition ? evaluateProduct(p) : null;
  const nutrientTags = getTags(p, 2);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    add(p, 1);
  };

  const handleQtyChange = (newQty) => {
    setQty(p.id, newQty);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full text-left group">
      {/* Product Image Container / Link */}
      <Link
        to={`/product/${p.id}`}
        className="block relative aspect-square rounded-[28px] bg-[var(--color-neutral-100,#f9f4ed)] overflow-hidden border border-[var(--color-divider)] p-4 flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
      >
        {!imgError && p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[var(--color-neutral-600,#82796a)]">
            <span className="w-12 h-12 rounded-full bg-[var(--color-neutral-200,#eee7db)] flex items-center justify-center">
              <ImageOff size={20} strokeWidth={2.75} />
            </span>
            <span className="text-[11px] font-semibold">Photo coming soon</span>
          </div>
        )}

        {/* Profile Verdict Badge */}
        {profile.condition && evaluation && (
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {evaluation.fits ? (
              <Tag tone="sage">
                {profile.condition === "diabetic"
                  ? "Diabetic fit"
                  : profile.condition === "hypertension"
                  ? "Hypertension fit"
                  : "Weight loss fit"}
              </Tag>
            ) : evaluation.isUnknown ? (
              <Tag tone="neutral">Unknown nutrition</Tag>
            ) : (
              <Tag tone="terracotta">
                {getMisfitReason(p) || "Over profile limit"}
              </Tag>
            )}
          </div>
        )}
      </Link>

      {/* Product Name and Info */}
      <Link
        to={`/product/${p.id}`}
        className="text-[15px] font-semibold text-[var(--color-ink,#201e1d)] leading-snug line-clamp-2 min-h-[40px] hover:text-[var(--color-sage-800,#3d472b)] transition-colors"
      >
        {p.name}
      </Link>

      {/* Nutrient tags */}
      <div className="flex items-center gap-1.5 flex-wrap min-h-[22px]">
        {nutrientTags.map((tag, idx) => (
          <Tag key={idx} tone="neutral" className="text-[10px] px-2 py-0">
            {tag}
          </Tag>
        ))}
      </div>

      {/* Price and Cart Stepper / Add button */}
      <div className="flex items-center justify-between min-h-[44px] pt-1 mt-auto gap-2">
        <span className="font-['Caprasimo',serif] text-[17px] sm:text-[20px] text-[var(--color-ink,#201e1d)] shrink-0">
          {formatPrice(p.price_per_unit)}
        </span>

        {qty === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${p.name} to basket`}
            className="w-[44px] h-[44px] rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] flex items-center justify-center transition-all hover:bg-[var(--color-sage-800,#3d472b)] active:scale-95 cursor-pointer shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
          >
            <Plus size={18} strokeWidth={2.75} />
          </button>
        ) : (
          <QtyStepper
            value={qty}
            min={0}
            max={20}
            size="sm"
            onChange={handleQtyChange}
            ariaLabel={`Quantity for ${p.name}`}
          />
        )}
      </div>
    </div>
  );
}

export default ProductCard;
