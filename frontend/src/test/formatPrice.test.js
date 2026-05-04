import { describe, it, expect } from 'vitest';
import { formatPrice } from '../utils/formatPrice';

describe('formatPrice', () => {
  it('formats whole rupee amounts without trailing decimals', () => {
    expect(formatPrice(150)).toBe('₹150');
    expect(formatPrice(70)).toBe('₹70');
    expect(formatPrice(2000)).toBe('₹2,000');
  });

  it('formats amounts with paise to two decimal places', () => {
    expect(formatPrice(150.5)).toBe('₹150.50');
    expect(formatPrice(99.99)).toBe('₹99.99');
  });

  it('handles zero and falsy inputs cleanly', () => {
    expect(formatPrice(0)).toBe('₹0');
    expect(formatPrice(null)).toBe('₹0');
    expect(formatPrice(undefined)).toBe('₹0');
  });
});
