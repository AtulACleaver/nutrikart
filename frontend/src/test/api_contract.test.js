import { describe, it, expect, beforeEach } from 'vitest';
import { getCategories, getProducts, getProduct, getProfileRules } from '../api/catalog';
import { getRecommendations } from '../api/recommend';
import { setFixtureMode } from '../api/client';

describe('API Contract & Fixture Mode', () => {
  beforeEach(() => {
    setFixtureMode(true);
  });

  it('loads categories correctly from fixture contract', async () => {
    const categories = await getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty('id');
    expect(categories[0]).toHaveProperty('name');
  });

  it('loads products conforming to the verified contract with provenance', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
    const item = products[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('price_per_unit');
    expect(item).toHaveProperty('measurement_basis');
    expect(item).toHaveProperty('verification_status');
  });

  it('fetches profile rules conforming to version 2 contract', async () => {
    const rules = await getProfileRules();
    expect(rules.version).toBe(2);
    expect(rules.basis).toBe('per_serving');
    expect(rules).toHaveProperty('conditions');
    expect(rules.conditions).toHaveProperty('diabetic');
    expect(rules.conditions.diabetic.limits.sugar_max).toBe(5.0);
  });

  it('returns valid recommendation payload with explanations', async () => {
    const recs = await getRecommendations({ budget: 500, health_condition: 'diabetic', household_size: 2 });
    expect(recs).toHaveProperty('recommendations');
    expect(recs).toHaveProperty('summary');
    expect(recs.recommendations[0]).toHaveProperty('selection_reason');
    expect(recs.recommendations[0].selection_reason).toContain('Selected:');
  });

  it('returns empty list and diagnostic summary on low budget empty match', async () => {
    const recs = await getRecommendations({ budget: 10, health_condition: 'diabetic', household_size: 1 });
    expect(recs.recommendations).toEqual([]);
    expect(recs.summary.message).toContain('No products match');
  });
});
