import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Store, ShoppingBasket, HelpCircle } from 'lucide-react';
import { useCart } from '../store/cartContext';

export function TabBar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const currentPath = location.pathname;

  const isPlanActive = currentPath === '/';
  const isShopActive = currentPath === '/shop';
  const isHowItWorksActive = currentPath === '/how-it-works';
  const isBasketActive = currentPath === '/cart';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-ground,#f5ead8)]/95 backdrop-blur-md border-t border-[var(--color-divider)] px-2 sm:px-4 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around max-w-[440px] mx-auto">
        {/* Plan Tab */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 min-w-[64px] transition-colors ${
            isPlanActive
              ? 'text-[var(--color-sage-800,#3d472b)]'
              : 'text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)]'
          }`}
        >
          <span
            className={`w-[52px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
              isPlanActive
                ? 'bg-[var(--color-sage-200,#e1eecc)]'
                : 'bg-transparent'
            }`}
          >
            <ClipboardList size={19} strokeWidth={2.75} />
          </span>
          <span className="text-[11px] font-bold">Plan</span>
        </Link>

        {/* Shop Tab */}
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-0.5 min-w-[64px] transition-colors ${
            isShopActive
              ? 'text-[var(--color-sage-800,#3d472b)]'
              : 'text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)]'
          }`}
        >
          <span
            className={`w-[52px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
              isShopActive
                ? 'bg-[var(--color-sage-200,#e1eecc)]'
                : 'bg-transparent'
            }`}
          >
            <Store size={19} strokeWidth={2.75} />
          </span>
          <span className="text-[11px] font-bold">Shop</span>
        </Link>

        {/* How It Works Tab */}
        <Link
          to="/how-it-works"
          className={`flex flex-col items-center gap-0.5 min-w-[64px] transition-colors ${
            isHowItWorksActive
              ? 'text-[var(--color-sage-800,#3d472b)]'
              : 'text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)]'
          }`}
        >
          <span
            className={`w-[52px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
              isHowItWorksActive
                ? 'bg-[var(--color-sage-200,#e1eecc)]'
                : 'bg-transparent'
            }`}
          >
            <HelpCircle size={19} strokeWidth={2.75} />
          </span>
          <span className="text-[11px] font-bold">Guide</span>
        </Link>

        {/* Basket Tab */}
        <Link
          to="/cart"
          className={`flex flex-col items-center gap-0.5 min-w-[64px] relative transition-colors ${
            isBasketActive
              ? 'text-[var(--color-sage-800,#3d472b)]'
              : 'text-[var(--color-neutral-700,#645c50)] hover:text-[var(--color-ink,#201e1d)]'
          }`}
        >
          <span
            className={`w-[52px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
              isBasketActive
                ? 'bg-[var(--color-sage-200,#e1eecc)]'
                : 'bg-transparent'
            }`}
          >
            <ShoppingBasket size={19} strokeWidth={2.75} />
          </span>
          {totalItems > 0 && (
            <span className="absolute top-0 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracotta-700,#8c491a)] text-[var(--color-ground,#f5ead8)] text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-[11px] font-bold">Basket</span>
        </Link>
      </div>
    </nav>
  );
}

export default TabBar;
