import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ShoppingBasket } from 'lucide-react';
import ProfilePill from './ProfilePill';
import { useCart } from '../store/cartContext';

export function AppHeader({ onCartClick }) {
  const location = useLocation();
  const { totalItems } = useCart();
  const currentPath = location.pathname;

  const isPlanActive = currentPath === '/';
  const isShopActive = currentPath === '/shop';

  return (
    <header className="w-full bg-[var(--color-ground,#f5ead8)] border-b border-[var(--color-divider)] md:border-none">
      <div className="max-w-[1152px] mx-auto px-5 md:px-8 lg:px-16 h-[72px] md:h-[84px] flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 focus-visible:outline rounded-lg">
          <span className="w-[36px] h-[36px] rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] flex items-center justify-center shrink-0">
            <Leaf size={19} strokeWidth={2.75} />
          </span>
          <span className="font-['Caprasimo',serif] text-[22px] md:text-[24px] text-[var(--color-ink,#201e1d)] tracking-tight">
            NutriKart
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-[15px] font-semibold">
          <Link
            to="/"
            className={`pb-1 transition-colors ${
              isPlanActive
                ? 'text-[var(--color-sage-800,#3d472b)] shadow-[inset_0_-2px_0_var(--color-sage-700,#56633f)]'
                : 'text-[var(--color-ink,#201e1d)] hover:text-[var(--color-sage-700,#56633f)]'
            }`}
          >
            Plan
          </Link>
          <Link
            to="/shop"
            className={`pb-1 transition-colors ${
              isShopActive
                ? 'text-[var(--color-sage-800,#3d472b)] shadow-[inset_0_-2px_0_var(--color-sage-700,#56633f)]'
                : 'text-[var(--color-ink,#201e1d)] hover:text-[var(--color-sage-700,#56633f)]'
            }`}
          >
            Shop
          </Link>
          <a
            href="/#how-it-works"
            className="pb-1 text-[var(--color-ink,#201e1d)] hover:text-[var(--color-sage-700,#56633f)] transition-colors"
          >
            How it works
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ProfilePill />

          <button
            type="button"
            onClick={onCartClick}
            aria-label={`Shopping basket with ${totalItems} items`}
            className="hidden md:inline-flex items-center gap-2 h-[44px] px-4 rounded-full border border-[var(--color-divider)] text-[14px] font-semibold text-[var(--color-ink,#201e1d)] hover:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_6%,transparent)] transition-colors cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)]"
          >
            <ShoppingBasket size={18} strokeWidth={2.75} />
            <span>Basket</span>
            {totalItems > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--color-terracotta-700,#8c491a)] text-[var(--color-ground,#f5ead8)] text-[12px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
