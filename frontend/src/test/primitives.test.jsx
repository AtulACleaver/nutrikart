import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Tag, Chip, QtyStepper, EmptyState } from '../components/ui';

describe('Shared UI Primitives', () => {
  describe('Button', () => {
    it('renders with label and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Add to Basket</Button>);
      const btn = screen.getByRole('button', { name: /add to basket/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('honors disabled state and prevents click execution', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Plan</Button>);
      const btn = screen.getByRole('button', { name: /disabled plan/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Tag', () => {
    it('renders text with tone styling', () => {
      render(<Tag tone="sage">Verified</Tag>);
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('Chip', () => {
    it('renders with aria-pressed based on selected state', () => {
      const { rerender } = render(<Chip selected={false}>Diabetic</Chip>);
      const chip = screen.getByRole('button', { name: 'Diabetic' });
      expect(chip).toHaveAttribute('aria-pressed', 'false');

      rerender(<Chip selected={true}>Diabetic</Chip>);
      expect(chip).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('QtyStepper', () => {
    it('increments and decrements within bounds', () => {
      const handleChange = vi.fn();
      render(<QtyStepper value={2} min={1} max={5} onChange={handleChange} />);

      const decBtn = screen.getByRole('button', { name: /decrease quantity/i });
      const incBtn = screen.getByRole('button', { name: /increase quantity/i });

      fireEvent.click(incBtn);
      expect(handleChange).toHaveBeenCalledWith(3);

      fireEvent.click(decBtn);
      expect(handleChange).toHaveBeenCalledWith(1);
    });

    it('disables decrement button at min boundary', () => {
      render(<QtyStepper value={1} min={1} max={5} onChange={() => {}} />);
      const decBtn = screen.getByRole('button', { name: /decrease quantity/i });
      expect(decBtn).toBeDisabled();
    });

    it('disables increment button at max boundary', () => {
      render(<QtyStepper value={5} min={1} max={5} onChange={() => {}} />);
      const incBtn = screen.getByRole('button', { name: /increase quantity/i });
      expect(incBtn).toBeDisabled();
    });
  });

  describe('EmptyState', () => {
    it('renders title, body, and action buttons', () => {
      render(
        <EmptyState
          title="No recipes found"
          body="Try broadening your filters."
          primaryAction={<Button>Reset</Button>}
        />
      );
      expect(screen.getByText('No recipes found')).toBeInTheDocument();
      expect(screen.getByText('Try broadening your filters.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });
});
