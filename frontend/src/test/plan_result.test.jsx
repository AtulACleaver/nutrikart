import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart } from '../store/cartContext';
import { ToastProvider } from '../components/ui/Toast';
import PlanResult from '../components/PlanResult';

const SAMPLE_RESULT = {
  recommendations: [
    {
      id: 32,
      name: 'Daawat Rice Flour - 500 g',
      price_per_unit: 70.0,
      quantity: 2,
      subtotal: 140.0,
      selection_reason: 'Selected: low sugar',
    },
    {
      id: 7,
      name: 'Amul Masti Curd',
      price_per_unit: 35.0,
      quantity: 1,
      subtotal: 35.0,
      selection_reason: 'Selected: high protein',
    },
  ],
  summary: {
    budget: 200.0,
    total_spent: 175.0,
  },
};

function TestWrapper({ children }) {
  return (
    <CartProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </CartProvider>
  );
}

describe('PlanResult & Basket Merging', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders preview items with initial quantities and plan total', () => {
    render(
      <TestWrapper>
        <PlanResult result={SAMPLE_RESULT} onEditPlan={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Recommended Items (2)')).toBeInTheDocument();
    expect(screen.getByText('Daawat Rice Flour - 500 g')).toBeInTheDocument();
    expect(screen.getByText('Amul Masti Curd')).toBeInTheDocument();
    const prices = screen.getAllByText('₹175');
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  it('updates preview quantities without modifying cart until commit', () => {
    let cartHook;
    function CartInspector() {
      cartHook = useCart();
      return null;
    }

    render(
      <TestWrapper>
        <CartInspector />
        <PlanResult result={SAMPLE_RESULT} onEditPlan={() => {}} />
      </TestWrapper>
    );

    // Initial cart should be empty
    expect(cartHook.totalItems).toBe(0);

    // Click commit CTA
    const addAllBtn = screen.getByRole('button', { name: /add all to basket/i });
    fireEvent.click(addAllBtn);

    // Now cart should have 3 items (2 rice flour + 1 curd)
    expect(cartHook.totalItems).toBe(3);
    expect(cartHook.totalCost).toBe(175);
    expect(screen.getByText(/added 2 planned items to basket/i)).toBeInTheDocument();
  });

  it('warns when combined total exceeds plan budget', () => {
    function PreloadedCart() {
      const { add } = useCart();
      React.useEffect(() => {
        add({ id: 99, name: 'Expensive Item', price_per_unit: 100 }, 1);
      }, [add]);
      return null;
    }

    render(
      <TestWrapper>
        <PreloadedCart />
        <PlanResult result={SAMPLE_RESULT} onEditPlan={() => {}} />
      </TestWrapper>
    );

    // 175 planned + 100 existing = 275 > budget 200
    expect(screen.getByText(/combined basket exceeds your plan budget by/i)).toBeInTheDocument();
    expect(screen.getByText('₹75')).toBeInTheDocument();
  });
});
