import React from 'react';
import AppHeader from './AppHeader';
import TabBar from './TabBar';

export function AppLayout({ children, onCartClick }) {
  return (
    <div className="min-h-screen bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] flex flex-col font-sans">
      <AppHeader onCartClick={onCartClick} />
      
      <main className="flex-1 w-full max-w-[1152px] mx-auto px-5 md:px-8 lg:px-16 pb-28 md:pb-16">
        {children}
      </main>

      <TabBar />
    </div>
  );
}

export default AppLayout;
