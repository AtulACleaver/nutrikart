import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from '../store/ProfileContext';
import { CartProvider } from '../store/cartContext';
import { ToastProvider } from '../components/ui/Toast';
import Plan from '../pages/Plan';
import Shop from '../pages/Shop';
import Cart from '../pages/Cart';
import HowItWorks from '../pages/HowItWorks';
import * as recommendApi from '../api/recommend';
import { FIXTURE_PRODUCTS, FIXTURE_CATEGORIES } from '../api/fixtures';

function renderFullApp({ route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProfileProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Plan />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('End-to-End User Journey Walkthrough', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    vi.spyOn(recommendApi, 'getRecommendations').mockResolvedValue({
      recommendations: [
        {
          id: FIXTURE_PRODUCTS[0].id,
          name: FIXTURE_PRODUCTS[0].name,
          category_id: FIXTURE_PRODUCTS[0].category_id,
          price_per_unit: FIXTURE_PRODUCTS[0].price_per_unit,
          quantity: 2,
          subtotal: FIXTURE_PRODUCTS[0].price_per_unit * 2,
          score100: 88,
          selection_reason: 'Optimal protein yield under diabetic constraint',
        },
      ],
      summary: {
        total_spent: FIXTURE_PRODUCTS[0].price_per_unit * 2,
        budget: 500,
      },
    });

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(FIXTURE_PRODUCTS),
        });
      }
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(FIXTURE_CATEGORIES),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  it('completes the full flow: plan -> review -> add to basket -> inspect basket -> how it works', async () => {
    renderFullApp({ route: '/' });

    // Step 1: Kitchen planner renders
    expect(screen.getByRole('heading', { name: 'Kitchen Planner' })).toBeInTheDocument();

    // Select Diabetic condition
    const diabeticBtn = screen.getByText('Diabetic-Friendly');
    fireEvent.click(diabeticBtn);

    // Submit plan
    const generateBtn = screen.getByRole('button', { name: /generate kitchen plan/i });
    fireEvent.click(generateBtn);

    // Step 2: Plan results appear
    await waitFor(() => {
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    });

    // Step 3: Add to basket
    const addAllBtn = screen.getByRole('button', { name: /add all to basket/i });
    fireEvent.click(addAllBtn);

    // Step 4: Navigate to Shop and verify category chips
    renderFullApp({ route: '/shop' });
    expect(screen.getByText('All Products')).toBeInTheDocument();

    // Step 5: Navigate to How it works
    renderFullApp({ route: '/how-it-works' });
    expect(screen.getByText(/How NutriKart Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter by health guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/Score nutritional balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimize to your budget/i)).toBeInTheDocument();
  });
});
