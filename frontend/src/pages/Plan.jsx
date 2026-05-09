import React from 'react';
import AppLayout from '../components/AppLayout';

export default function Plan() {
  return (
    <AppLayout>
      <div className="py-8 md:py-12">
        <div className="max-w-[720px]">
          <h1 className="font-['Caprasimo',serif] text-[36px] md:text-[44px] text-[var(--color-ink,#201e1d)] leading-tight mb-4">
            Kitchen Planner
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--color-neutral-800,#474238)] leading-relaxed">
            Plan balanced, whole-household groceries tailored to your budget and nutritional guidelines.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
