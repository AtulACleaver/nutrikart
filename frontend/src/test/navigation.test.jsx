import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '../store/ProfileContext';
import { CartProvider } from '../store/cartContext';
import AppHeader from '../components/AppHeader';
import TabBar from '../components/TabBar';
import ProfilePill from '../components/ProfilePill';

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProfileProvider>
        <CartProvider>
          {ui}
        </CartProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('Navigation and Profile Controls', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('AppHeader', () => {
    it('renders brand and navigation links with active highlighting', () => {
      renderWithProviders(<AppHeader onCartClick={() => {}} />, { route: '/' });

      expect(screen.getByText('NutriKart')).toBeInTheDocument();
      const planLink = screen.getByRole('link', { name: 'Plan' });
      expect(planLink).toBeInTheDocument();
      // Plan should be active on route /
      expect(planLink.className).toContain('text-[var(--color-sage-800,#3d472b)]');

      const shopLink = screen.getByRole('link', { name: 'Shop' });
      expect(shopLink).toBeInTheDocument();
    });

    it('triggers onCartClick when desktop basket button is pressed', () => {
      const handleCartClick = vi.fn();
      renderWithProviders(<AppHeader onCartClick={handleCartClick} />);

      const basketBtn = screen.getByRole('button', { name: /shopping basket/i });
      fireEvent.click(basketBtn);
      expect(handleCartClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TabBar', () => {
    it('renders Plan, Shop and Basket navigation on mobile', () => {
      renderWithProviders(<TabBar />, { route: '/shop' });

      expect(screen.getByRole('link', { name: /plan/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /shop/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /basket/i })).toBeInTheDocument();
    });
  });

  describe('ProfilePill', () => {
    it('toggles profile popover and updates condition', () => {
      renderWithProviders(<ProfilePill />);

      const pillBtn = screen.getByRole('button', { name: /no profile set/i });
      expect(pillBtn).toBeInTheDocument();

      // Open popover
      fireEvent.click(pillBtn);
      expect(screen.getByRole('dialog', { name: /profile settings/i })).toBeInTheDocument();

      // Select diabetic
      const diabeticBtn = screen.getByRole('button', { name: /diabetic-friendly/i });
      fireEvent.click(diabeticBtn);

      // Pill label should now reflect diabetic profile
      const matches = screen.getAllByText(/diabetic-friendly/i);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
