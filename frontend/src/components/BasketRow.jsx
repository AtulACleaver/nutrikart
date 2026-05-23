import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, ImageOff } from "lucide-react";
import { Tag, QtyStepper } from "./ui";
import { formatPrice } from "../utils/formatPrice";

export default function BasketRow({
  product,
  qty,
  onQtyChange,
  onRemove,
  variant = "page",
  reason = null,
  removable = true,
}) {
  const [imgError, setImgError] = useState(false);
  const compact = variant === "compact";
  const lineTotal = (product.price_per_unit || 0) * qty;

  return (
    <div
      className={`flex items-center gap-3.5 w-full text-[var(--color-ink,#201e1d)] border-b border-[var(--color-divider)] ${
        compact ? "py-2.5" : "py-3.5 md:py-4"
      }`}
    >
      {/* Thumbnail */}
      <Link
        to={`/product/${product.id}`}
        tabIndex={-1}
        className={`rounded-full bg-[var(--color-neutral-100,#f9f4ed)] border border-[var(--color-divider)] flex items-center justify-center shrink-0 overflow-hidden hover:opacity-90 transition-opacity ${
          compact ? "w-11 h-11" : "w-13 h-13 md:w-14 md:h-14"
        }`}
      >
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-[74%] h-[78%] object-contain"
            loading="lazy"
          />
        ) : (
          <ImageOff size={compact ? 16 : 18} className="text-[var(--color-neutral-500,#9c9383)]" />
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-1.5">
        <Link
          to={`/product/${product.id}`}
          className={`font-semibold text-[var(--color-ink,#201e1d)] hover:text-[var(--color-terracotta-700,#8c491a)] transition-colors leading-snug line-clamp-2 ${
            compact ? "text-[14px]" : "text-[15px]"
          }`}
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap">
          {reason && <Tag tone="sage" className="text-[11px] px-2 py-0">{reason}</Tag>}
          <span className="text-[12px] text-[var(--color-neutral-700,#645c50)]">
            {formatPrice(product.price_per_unit)} each
          </span>
        </div>
      </div>

      {/* Qty Stepper */}
      <div className="shrink-0">
        <QtyStepper
          value={qty}
          size="sm"
          onChange={onQtyChange}
          aria-label={`Quantity for ${product.name}`}
        />
      </div>

      {/* Line Total */}
      <div
        className={`text-right font-['Caprasimo',serif] font-bold text-[var(--color-ink,#201e1d)] shrink-0 ${
          compact ? "w-16 text-[14px]" : "w-20 text-[15px]"
        }`}
      >
        {formatPrice(lineTotal)}
      </div>

      {/* Optional Removable 'X' Button */}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name} from basket`}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-neutral-600,#82796a)] hover:text-[var(--color-terracotta-700,#8c491a)] hover:bg-[color-mix(in_srgb,var(--color-terracotta-500)_10%,transparent)] transition-colors cursor-pointer shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

