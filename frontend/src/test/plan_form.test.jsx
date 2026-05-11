import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '../store/ProfileContext';
import { CartProvider } from '../store/cartContext';
import ConditionPicker from '../components/ConditionPicker';
import BudgetField from '../components/BudgetField';
import Plan from '../pages/Plan';

describe('Plan Form & ConditionPicker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ConditionPicker', () => {
    it('renders 4 conditions in cards mode and selects on click', () => {
      const handleChange = vi.fn();
      render(
        <ConditionPicker
          value={null}
          onChange={handleChange}
          variant="cards"
        />
      );

      const diabeticBtn = screen.getByRole('radio', { name: /diabetic-friendly/i });
      expect(diabeticBtn).toBeInTheDocument();
      fireEvent.click(diabeticBtn);
      expect(handleChange).toHaveBeenCalledWith('diabetic');
    });

    it('supports keyboard navigation via arrow keys', () => {
      const handleChange = vi.fn();
      render(
        <ConditionPicker
          value={null}
          onChange={handleChange}
          variant="pills"
        />
      );

      const allFoodsRadio = screen.getByRole('radio', { name: /all foods/i });
      allFoodsRadio.focus();
      fireEvent.keyDown(allFoodsRadio, { key: 'ArrowDown' });
      expect(handleChange).toHaveBeenCalledWith('diabetic');
    });
  });

  describe('BudgetField', () => {
    it('shows inline warning when budget is below ₹50', () => {
      render(<BudgetField value={20} onChange={() => {}} />);
      expect(screen.getByRole('alert')).toHaveTextContent(/minimum plan budget is ₹50/i);
    });

    it('updates value when quick preset chip is clicked', () => {
      const handleChange = vi.fn();
      render(<BudgetField value={500} onChange={handleChange} />);
      const chip1000 = screen.getByRole('button', { name: '₹1000' });
      fireEvent.click(chip1000);
      expect(handleChange).toHaveBeenCalledWith(1000);
    });
  });

  describe('Plan Page Integration', () => {
    it('renders plan form and disables CTA when budget is below ₹50', () => {
      localStorage.setItem('nk.profile', JSON.stringify({ budget: 30, condition: null, household: 2 }));

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
      expect(submitBtn).toBeDisabled();
    });
  });
});
