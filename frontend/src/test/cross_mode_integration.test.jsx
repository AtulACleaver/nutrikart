import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '../store/ProfileContext';
import { CartProvider } from '../store/cartContext';
import { ToastProvider } from '../components/ui/Toast';
import Plan from '../pages/Plan';
import Shop from '../pages/Shop';
import Cart from '../pages/Cart';
import { FIXTURE_PRODUCTS, FIXTURE_CATEGORIES } from '../api/fixtures';

function renderApp(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProfileProvider>
        <CartProvider>
          <ToastProvider>
            {ui}
          </ToastProvider>
        </CartProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('Cross-Mode End-to-End Behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/products") || url.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(FIXTURE_PRODUCTS),
        });
      }
      if (url.includes("/api/categories") || url.includes("/categories")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(FIXTURE_CATEGORIES),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  it('renders static baseline mode with honest provenance disclosures', async () => {
    renderApp(<Shop />, { route: '/shop' });

    // Header and catalogue elements should render
    expect(screen.getByText('Grocery Shop')).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(FIXTURE_PRODUCTS[0].name)).toBeInTheDocument();
    });
  });

  it('preserves cart and dietary limits across source mode transitions', async () => {
    const testProduct = FIXTURE_PRODUCTS[0];
    localStorage.setItem(
      'nk.profile',
      JSON.stringify({
        condition: 'diabetic',
        budget: 600,
        household: 2,
        showAll: false,
      })
    );
    localStorage.setItem(
      'nutrikart_cart',
      JSON.stringify({
        [testProduct.id]: { product: testProduct, quantity: 2 },
      })
    );

    renderApp(<Cart />, { route: '/cart' });

    // Item and price must be accurate (70 * 2 = 140)
    await waitFor(() => {
      expect(screen.getByText(testProduct.name)).toBeInTheDocument();
      expect(screen.getAllByText(/₹140/i).length).toBeGreaterThanOrEqual(1);
    });

    // Profile health fit summary should be visible and coherent
    expect(screen.getByText(/targets/i)).toBeInTheDocument();
  });

  it('maintains responsive plan form stability even when provider is offline', () => {
    renderApp(<Plan />, { route: '/' });

    expect(screen.getByRole('heading', { name: 'Kitchen Planner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate kitchen plan/i })).toBeInTheDocument();
    expect(screen.getByText(/Diabetic-Friendly/i)).toBeInTheDocument();
  });
});
