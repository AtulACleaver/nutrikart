import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ShoppingBasket, FileDown, ArrowRight } from "lucide-react";
import { useCart } from "../store/cartContext";
import { useProfile } from "../store/ProfileContext";
import BasketRow from "./BasketRow";
import { Button, EmptyState } from "./ui";
import { formatPrice } from "../utils/formatPrice";
import { exportCartPdf } from "../utils/exportPDF";

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { entries, totalItems, totalCost, setQty } = useCart();
  const { profile, evaluateProduct, getTags } = useProfile();

  const drawerRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Focus trapping and Esc key listener
  useEffect(() => {
    if (open) {
      previouslyFocusedElementRef.current = document.activeElement;
      // Focus drawer panel on open
      drawerRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else if (previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus?.();
    }
  }, [open, onClose]);

  if (!open) return null;

  // Fit count calculation for prompt card
  const fitCount = profile.condition
    ? entries.filter(({ product }) => evaluateProduct(product).fits).length
    : entries.length;

  const handleExport = () => {
    try {
      exportCartPdf(entries, totalCost, profile);
      onClose();
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Basket Drawer"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_45%,transparent)] backdrop-blur-[2px] transition-opacity duration-240"
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative z-10 m-3 w-[440px] max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] rounded-[36px] bg-[var(--color-ground,#f5ead8)] border border-[var(--color-divider)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-240 focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-divider)]">
          <div className="flex items-center gap-2.5">
            <h2 className="font-['Caprasimo',serif] text-[26px] md:text-[28px] text-[var(--color-ink,#201e1d)]">
              Basket
            </h2>
            {totalItems > 0 && (
              <span className="min-w-[24px] h-[24px] px-2 rounded-full bg-[var(--color-terracotta-700,#8c491a)] text-[var(--color-ground,#f5ead8)] text-[12px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close basket drawer"
            className="w-11 h-11 rounded-full bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] flex items-center justify-center text-[var(--color-ink,#201e1d)] hover:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_8%,transparent)] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        {totalItems === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <EmptyState
              tone="sage"
              icon={<ShoppingBasket size={28} strokeWidth={2.5} />}
              title="Your basket is empty"
              body="Add healthy groceries from the shop or let our kitchen planner build a balanced basket."
              primaryAction={
                <Button
                  variant="plan"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate("/");
                  }}
                >
                  Plan a basket
                </Button>
              }
              secondaryAction={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate("/shop");
                  }}
                >
                  Browse shop
                </Button>
              }
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-[var(--color-divider)]">
            {entries.map(({ product, quantity }) => {
              const tags = getTags(product, 1);
              return (
                <BasketRow
                  key={product.id}
                  product={product}
                  qty={quantity}
                  reason={tags[0]}
                  variant="compact"
                  removable={false}
                  onQtyChange={(newQty) => setQty(product.id, newQty)}
                />
              );
            })}

            {/* Planner prompt card if no plan active */}
            {profile.condition && profile.budget && (
              <div className="my-4 p-4 rounded-2xl bg-[var(--color-sage-100,#f0fae1)] border border-[var(--color-sage-300,#ccdbb2)] text-[13px] text-[var(--color-sage-900,#272e1b)] flex flex-col gap-2">
                <div className="font-bold">
                  {fitCount} of {entries.length} items fit your {profile.condition} targets
                </div>
                <p className="text-[var(--color-sage-800,#3d472b)]">
                  Want the planner to balance the rest of your ₹{profile.budget} budget?
                </p>
                <Link
                  to="/"
                  onClick={onClose}
                  className="font-bold text-[var(--color-sage-900,#272e1b)] hover:underline inline-flex items-center gap-1.5"
                >
                  Plan around these <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pinned Footer */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-divider)] bg-[var(--color-surface,#ebddc5)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[var(--color-neutral-700,#645c50)] uppercase tracking-wider">
                Total
              </span>
              <span className="font-['Caprasimo',serif] text-[28px] md:text-[30px] text-[var(--color-ink,#201e1d)]">
                {formatPrice(totalCost)}
              </span>
            </div>

            <Button
              variant="basket"
              size="lg"
              className="w-full"
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              View basket ({totalItems})
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={handleExport}
            >
              <FileDown size={17} strokeWidth={2.5} />
              Export PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
