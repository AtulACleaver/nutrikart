import React from 'react';
import TopBar from './TopBar';

export function AppLayout({ children, header, bottomNav, onCartClick }) {
  return (
    <div className="min-h-screen bg-[var(--color-ground,#f5ead8)] text-[var(--color-ink,#201e1d)] flex flex-col font-sans">
      {header || <TopBar onCartClick={onCartClick} />}
      
      <main className="flex-1 w-full max-w-[1152px] mx-auto px-5 md:px-8 lg:px-16 pb-24 md:pb-12">
        {children}
      </main>

      {bottomNav && (
        <div className="md:hidden">
          {bottomNav}
        </div>
      )}
    </div>
  );
}

export default AppLayout;
