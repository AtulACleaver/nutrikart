import React, { useState } from 'react';
import { useCart } from '../store/cartContext';
import { useToast } from './ui/Toast';
import { Button, Tag, QtyStepper } from './ui';
import { formatPrice } from '../utils/formatPrice';
import { ShoppingBasket, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function PlanResult({ result, onEditPlan }) {
  const { totalCost: existingCartCost, totalItems: existingCartItems, itemsById, mergeItems, restoreItems } = useCart();
  const { showToast } = useToast();

  const [previewItems, setPreviewItems] = useState(() =>
    (result?.recommendations || []).map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 1,
    }))
  );

  const budget = Number(result?.summary?.budget) || 500;

  // Handle preview quantity changes
  const handleQtyChange = (id, newQty) => {
    if (newQty <= 0) {
      setPreviewItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setPreviewItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, quantity: newQty, subtotal: newQty * (Number(item.price_per_unit) || 0) }
            : item
        )
      );
    }
  };

  const planTotal = previewItems.reduce(
    (sum, item) => sum + (Number(item.price_per_unit) || 0) * item.quantity,
    0
  );
  const totalPlannedUnits = previewItems.reduce((sum, item) => sum + item.quantity, 0);

  const combinedTotal = planTotal + existingCartCost;
  const isOverBudget = combinedTotal > budget;
  const overAmount = Math.max(0, combinedTotal - budget);

  const budgetPercent = Math.min(100, Math.round((combinedTotal / budget) * 100));

  const handleCommitToBasket = () => {
    if (previewItems.length === 0) return;

    // Snapshot existing cart items for undo
    const snapshot = { ...itemsById };

    mergeItems(previewItems);

    showToast({
      message: `Added ${previewItems.length} planned items to basket`,
      actionLabel: 'Undo',
      onAction: () => {
        restoreItems(snapshot);
      },
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in">
      {/* LEFT COLUMN: Recommendation Items List */}
      <div className="flex-1 w-full bg-[var(--color-surface,#ebddc5)]/40 rounded-[36px] border border-[var(--color-divider)] p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-divider)]">
          <div>
            <h3 className="font-['Caprasimo',serif] text-[24px] text-[var(--color-ink,#201e1d)]">
              Recommended Items ({previewItems.length})
            </h3>
            <p className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
              Edit quantities before adding to your basket
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={onEditPlan}>
            <SlidersHorizontal size={15} strokeWidth={2.75} />
            Edit plan
          </Button>
        </div>

        {previewItems.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-neutral-700,#645c50)]">
            <p className="text-[16px] mb-4">All recommended items were removed from this preview.</p>
            <Button variant="secondary" size="md" onClick={onEditPlan}>
              Re-generate plan
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-divider)]">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-[52px] h-[52px] rounded-full bg-[var(--color-neutral-100,#f9f4ed)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-divider)]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="font-bold text-[18px] text-[var(--color-sage-700,#56633f)]">
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[15px] text-[var(--color-ink,#201e1d)] line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
                        {formatPrice(item.price_per_unit)} each
                      </span>
                      {item.selection_reason && (
                        <Tag tone="sage" className="truncate max-w-[280px]">
                          {item.selection_reason}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <QtyStepper
                    value={item.quantity}
                    min={0}
                    max={20}
                    size="sm"
                    onChange={(newQty) => handleQtyChange(item.id, newQty)}
                    ariaLabel={`Quantity for ${item.name}`}
                  />
                  <span className="font-['Caprasimo',serif] text-[17px] text-[var(--color-ink,#201e1d)] w-[70px] text-right">
                    {formatPrice(item.price_per_unit * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Summary Card & Commitment CTA */}
      <div className="w-full lg:w-[360px] shrink-0 sticky top-6 bg-[var(--color-ground,#f5ead8)] rounded-[36px] border border-[var(--color-divider)] p-6 md:p-8 shadow-md flex flex-col gap-6">
        <div>
          <h3 className="font-['Caprasimo',serif] text-[20px] text-[var(--color-ink,#201e1d)]">
            Basket Summary
          </h3>
        </div>

        {/* Budget Progress Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px] font-bold">
            <span className="text-[var(--color-neutral-800,#474238)]">Budget Progress</span>
            <span className={isOverBudget ? 'text-[var(--color-terracotta-700,#8c491a)]' : 'text-[var(--color-sage-800,#3d472b)]'}>
              {budgetPercent}% utilized
            </span>
          </div>

          <div
            className="w-full h-3 rounded-full bg-[var(--color-surface,#ebddc5)] overflow-hidden"
            role="progressbar"
            aria-valuenow={combinedTotal}
            aria-valuemin={0}
            aria-valuemax={budget}
            aria-label="Budget consumption meter"
          >
            <div
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget
                  ? 'bg-[var(--color-terracotta-600,#b2622d)]'
                  : 'bg-[var(--color-sage-600,#728157)]'
              }`}
            />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2.5 pt-4 border-t border-[var(--color-divider)] text-[14px]">
          <div className="flex justify-between text-[var(--color-neutral-800,#474238)]">
            <span>Planned items ({totalPlannedUnits} units)</span>
            <span className="font-semibold">{formatPrice(planTotal)}</span>
          </div>

          {existingCartCost > 0 && (
            <div className="flex justify-between text-[var(--color-neutral-800,#474238)]">
              <span>Existing basket ({existingCartItems} units)</span>
              <span className="font-semibold">{formatPrice(existingCartCost)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-[var(--color-divider)] text-[16px] font-bold text-[var(--color-ink,#201e1d)]">
            <span>Combined Total</span>
            <span className="font-['Caprasimo',serif] text-[22px]">
              {formatPrice(combinedTotal)}
            </span>
          </div>
        </div>

        {/* Warning if over budget */}
        {isOverBudget && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-terracotta-100,#fff2eb)] border border-[var(--color-terracotta-300,#ffc6a5)] flex items-start gap-2.5 text-[13px] text-[var(--color-terracotta-900,#402310)]">
            <AlertTriangle size={18} strokeWidth={2.75} className="shrink-0 text-[var(--color-terracotta-600,#b2622d)] mt-0.5" />
            <span>
              Combined basket exceeds your plan budget by <strong>{formatPrice(overAmount)}</strong>.
            </span>
          </div>
        )}

        {/* Add All to Basket CTA */}
        <Button
          variant="basket"
          size="lg"
          disabled={previewItems.length === 0}
          onClick={handleCommitToBasket}
          className="w-full"
        >
          <ShoppingBasket size={18} strokeWidth={2.75} />
          Add all to basket
        </Button>
      </div>
    </div>
  );
}

export default PlanResult;

