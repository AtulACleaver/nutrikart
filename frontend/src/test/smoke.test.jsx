import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../store/cartContext';
import { ProfileProvider } from '../store/ProfileContext';
import Plan from '../pages/Plan';
import Shop from '../pages/Shop';
import Cart from '../pages/Cart';

describe('Route Shell Smoke Tests', () => {
  it('renders Plan route at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProfileProvider>
          <CartProvider>
            <Plan />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Kitchen Planner')).toBeInTheDocument();
  });

  it('renders Shop route at /shop', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/shop']}>
        <ProfileProvider>
          <CartProvider>
            <Shop />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('renders Cart route at /cart', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/cart']}>
        <ProfileProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
