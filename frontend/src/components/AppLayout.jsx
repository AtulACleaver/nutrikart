import React, { useState } from 'react';
import AppHeader from './AppHeader';
import TabBar from './TabBar';
import CartDrawer from './CartDrawer';

export function AppLayout({ children, onCartClick }) {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  const handleCartClick = onCartClick || (() => setInternalDrawerOpen(true));

  return (
    <div className="min-h-screen bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] flex flex-col font-sans">
      <AppHeader onCartClick={handleCartClick} />
      
      <main className="flex-1 w-full max-w-[1152px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pb-28 md:pb-16">
        {children}
      </main>

      <TabBar />

      {!onCartClick && (
        <CartDrawer
          open={internalDrawerOpen}
          onClose={() => setInternalDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export default AppLayout;
