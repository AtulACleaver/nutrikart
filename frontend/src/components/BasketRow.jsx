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
          compact ? "w-12 h-12" : "w-14 h-14 md:w-16 md:h-16"
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
          <ImageOff size={compact ? 16 : 20} className="text-[var(--color-neutral-500,#9c9383)]" />
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-1 min-w-0 pr-2">
        <Link
          to={`/product/${product.id}`}
          className={`font-semibold text-[var(--color-ink,#201e1d)] hover:text-[var(--color-terracotta-700,#8c491a)] transition-colors line-clamp-2 leading-snug ${
            compact ? "text-[14px]" : "text-[15px] md:text-[16px]"
          }`}
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {reason && <Tag tone="sage">{reason}</Tag>}
          <span className="text-[13px] text-[var(--color-neutral-700,#645c50)] font-medium">
            {formatPrice(product.price_per_unit)} each
          </span>
        </div>
      </div>

      {/* Qty Stepper */}
      <div className="shrink-0">
        <QtyStepper
          value={qty}
          onChange={onQtyChange}
          aria-label={`Quantity for ${product.name}`}
        />
      </div>

      {/* Line Total */}
      <div
        className={`text-right font-bold text-[var(--color-ink,#201e1d)] shrink-0 ${
          compact ? "w-14 text-[14px]" : "w-16 md:w-20 text-[15px] md:text-[16px]"
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
