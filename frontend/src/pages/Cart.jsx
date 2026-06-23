import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBasket, FileDown, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../store/cartContext";
import { useProfile } from "../store/ProfileContext";
import { useToast, ConfirmDialog, Button, Tag, EmptyState } from "../components/ui";
import BasketRow from "../components/BasketRow";
import AppLayout from "../components/AppLayout";
import { formatPrice } from "../utils/formatPrice";
import { exportCartPdf } from "../utils/exportPDF";

export default function Cart() {
  const navigate = useNavigate();
  const { entries, totalItems, totalCost, setQty, clear, restoreItems } = useCart();
  const { profile, evaluateProduct, getTags } = useProfile();
  const { showToast } = useToast();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Check last plan state
  const lastPlanData = useMemo(() => {
    try {
      const stored = localStorage.getItem("nk.lastPlan");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const planStatusTag = useMemo(() => {
    if (!lastPlanData || !lastPlanData.items || entries.length === 0) return null;
    const planItems = lastPlanData.items;

    // Check if items and quantities match exactly
    const matchesExactly =
      planItems.length === entries.length &&
      planItems.every((pi) => {
        const found = entries.find((e) => e.product.id === pi.product.id);
        return found && found.quantity === pi.qty;
      });

    if (matchesExactly) {
      const conditionName =
        lastPlanData.condition === "diabetic"
          ? "Diabetic"
          : lastPlanData.condition === "hypertension"
          ? "Hypertension"
          : lastPlanData.condition === "weight_loss"
          ? "Weight-loss"
          : "Health";
      return `From your ${conditionName} plan`;
    }

    return "Edited from your plan";
  }, [lastPlanData, entries]);

  // Profile fit breakdown
  const fitBreakdown = useMemo(() => {
    if (!profile.condition) return null;
    let fitsCount = 0;
    let misfitCount = 0;

    entries.forEach(({ product }) => {
      const ev = evaluateProduct(product);
      if (ev.fits) fitsCount++;
      else misfitCount++;
    });

    return {
      fitsCount,
      misfitCount,
      allFit: misfitCount === 0,
    };
  }, [profile.condition, entries, evaluateProduct]);

  // Handle single item removal
  const handleRemoveItem = (product, previousQty) => {
    setQty(product.id, 0);
    showToast(`${product.name} removed`, {
      actionLabel: "Undo",
      onAction: () => setQty(product.id, previousQty),
    });
  };

  // Handle clear basket confirmation
  const handleConfirmClear = () => {
    const snapshot = [...entries];
    clear();
    setConfirmClearOpen(false);
    showToast("Basket cleared", {
      actionLabel: "Undo",
      onAction: () => restoreItems(snapshot),
    });
  };

  // Handle PDF Export
  const handleExport = () => {
    try {
      exportCartPdf(entries, totalCost, profile);
      showToast("Shopping list downloaded");
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("Could not generate PDF");
    }
  };

  if (totalItems === 0) {
    return (
      <AppLayout>
        <div className="max-w-[1152px] mx-auto px-5 md:px-8 py-20">
          <EmptyState
            tone="sage"
            icon={<ShoppingBasket size={32} strokeWidth={2.5} />}
            title="Your basket is empty"
            body="Build one around your health in about a minute, or browse the shelves yourself."
            primaryAction={
              <Button variant="plan" size="md" onClick={() => navigate("/")}>
                Plan a basket
              </Button>
            }
            secondaryAction={
              <Button variant="secondary" size="md" onClick={() => navigate("/shop")}>
                Browse shop
              </Button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const budget = profile.budget || 0;
  const underBudget = budget > 0 ? budget - totalCost : 0;
  const budgetRatio = budget > 0 ? Math.min(1.2, totalCost / budget) : 0;

  return (
    <AppLayout>
      <div className="max-w-[1152px] mx-auto px-5 md:px-8 py-6 md:py-10">
        {/* Mobile Header / Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-14 items-start">
          {/* Left Column: Items List */}
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--color-divider)]">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-['Caprasimo',serif] text-[28px] md:text-[34px] text-[var(--color-ink,#201e1d)] leading-tight">
                    Your basket
                  </h1>
                  <span className="text-[15px] md:text-[16px] font-semibold text-[var(--color-neutral-700,#645c50)]">
                    ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                </div>
                {planStatusTag && (
                  <div className="mt-1">
                    <Tag tone="sage">{planStatusTag}</Tag>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 text-[13px] md:text-[14px] font-bold text-[var(--color-sage-800,#3d472b)] hover:text-[var(--color-sage-900,#272e1b)] p-2 rounded-lg transition-colors cursor-pointer"
                  title="Export shopping list as PDF"
                >
                  <FileDown size={15} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[13px] md:text-[14px] font-bold text-[var(--color-terracotta-700,#8c491a)] hover:text-[var(--color-terracotta-900,#4a2107)] p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                  <span>Clear basket</span>
                </button>
              </div>
            </div>

            {/* Rows List */}
            <div className="divide-y divide-[var(--color-divider)]">
              {entries.map(({ product, quantity }) => {
                const tags = getTags(product, 1);
                return (
                  <BasketRow
                    key={product.id}
                    product={product}
                    qty={quantity}
                    reason={tags[0]}
                    variant="page"
                    onQtyChange={(newQty) => {
                      if (newQty === 0) {
                        handleRemoveItem(product, quantity);
                      } else {
                        setQty(product.id, newQty);
                      }
                    }}
                    onRemove={() => handleRemoveItem(product, quantity)}
                  />
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-terracotta-700,#8c491a)] hover:underline"
              >
                <ArrowLeft size={16} />
                Continue shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="rounded-[28px] sm:rounded-[36px] md:rounded-[40px] bg-[var(--color-neutral-100,#f9f4ed)] border border-[var(--color-divider)] p-5 sm:p-6 md:p-8 shadow-sm flex flex-col gap-5 sm:gap-6 lg:sticky lg:top-24">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-neutral-700,#645c50)] mb-1">
                Total
              </div>
              <div className="font-['Caprasimo',serif] text-[44px] md:text-[52px] text-[var(--color-ink,#201e1d)] leading-none">
                {formatPrice(totalCost)}
              </div>
            </div>

            {/* Budget Meter (if budget configured) */}
            {budget > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-neutral-300,#ded5c3)]">
                <div className="flex justify-between items-center text-[14px] font-bold">
                  <span className="text-[var(--color-ink,#201e1d)]">
                    Budget: {formatPrice(budget)}
                  </span>
                  <span
                    className={
                      underBudget >= 0
                        ? "text-[var(--color-sage-800,#3d472b)]"
                        : "text-[var(--color-terracotta-700,#8c491a)]"
                    }
                  >
                    {underBudget >= 0
                      ? `${formatPrice(underBudget)} under plan`
                      : `${formatPrice(Math.abs(underBudget))} over plan`}
                  </span>
                </div>
                <div className="w-full h-3 bg-[var(--color-neutral-200,#eee7db)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalCost <= budget
                        ? "bg-[var(--color-sage-700,#56633f)]"
                        : "bg-[var(--color-terracotta-700,#8c491a)]"
                    }`}
                    style={{ width: `${Math.min(100, Math.round(budgetRatio * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Profile Health Fit Summary */}
            {fitBreakdown && (
              <div className="p-3.5 rounded-2xl bg-[var(--color-surface,#ebddc5)] text-[13px] font-semibold text-[var(--color-ink,#201e1d)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-sage-700,#56633f)] shrink-0" />
                <span>
                  {fitBreakdown.allFit
                    ? `All ${entries.length} items fit your ${profile.condition} targets.`
                    : `${fitBreakdown.fitsCount} items fit; ${fitBreakdown.misfitCount} outside ${profile.condition} limits.`}
                </span>
              </div>
            )}

            {/* Export Action */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="basket"
                size="lg"
                className="w-full"
                onClick={handleExport}
                aria-label="Export shopping list to PDF"
              >
                <FileDown size={19} strokeWidth={2.75} />
                Export shopping list (PDF)
              </Button>

              <Link
                to="/"
                className="text-center text-[13px] font-semibold text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)] transition-colors py-1"
              >
                Back to my plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Clear Basket */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Clear your basket?"
        description={`This removes all ${totalItems} items. Your profile and plan settings will stay intact.`}
        confirmLabel="Clear basket"
        cancelLabel="Keep items"
        isDestructive={true}
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </AppLayout>
  );
}
