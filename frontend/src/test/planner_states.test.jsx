import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '../store/ProfileContext';
import { CartProvider } from '../store/cartContext';
import Plan from '../pages/Plan';
import * as recommendApi from '../api/recommend';

describe('Planner Request States', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders result state on successful recommendation response', async () => {
    vi.spyOn(recommendApi, 'getRecommendations').mockResolvedValueOnce({
      recommendations: [
        {
          id: 32,
          name: 'Daawat Rice Flour - 500 g',
          price_per_unit: 70.0,
          quantity: 2,
          subtotal: 140.0,
          selection_reason: 'Selected for diabetic profile',
        },
      ],
      summary: {
        total_spent: 140.0,
        budget: 500.0,
      },
    });

    render(
      <MemoryRouter>
        <ProfileProvider>
          <CartProvider>
            <Plan />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /generate kitchen plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Optimal Kitchen Basket')).toBeInTheDocument();
      expect(screen.getByText('Daawat Rice Flour - 500 g')).toBeInTheDocument();
    });
  });

  it('renders empty state when zero recommendations are returned', async () => {
    vi.spyOn(recommendApi, 'getRecommendations').mockResolvedValueOnce({
      recommendations: [],
      summary: {
        message: 'No products match your criteria.',
      },
    });

    render(
      <MemoryRouter>
        <ProfileProvider>
          <CartProvider>
            <Plan />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /generate kitchen plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/no basket matches/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adjust inputs/i })).toBeInTheDocument();
    });
  });

  it('renders error state on API failure and provides retry action', async () => {
    vi.spyOn(recommendApi, 'getRecommendations').mockRejectedValueOnce(
      new Error('API failure')
    );

    render(
      <MemoryRouter>
        <ProfileProvider>
          <CartProvider>
            <Plan />
          </CartProvider>
        </ProfileProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /generate kitchen plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/could not generate plan/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
