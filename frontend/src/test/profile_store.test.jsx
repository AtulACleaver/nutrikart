import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProfileProvider, useProfile } from '../store/ProfileContext';
import { fitsProfile, topNutrientTags } from '../utils/healthLimits';

describe('Profile State & Health Limit Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('fitsProfile', () => {
    it('approves products meeting diabetic constraints', () => {
      const product = {
        name: 'Oatmeal',
        sugar: 1.2,
        calories: 120,
        measurement_basis: 'per_serving',
        verification_status: 'verified',
      };
      const result = fitsProfile(product, 'diabetic');
      expect(result.fits).toBe(true);
      expect(result.isUnknown).toBe(false);
    });

    it('rejects products exceeding diabetic sugar limits', () => {
      const product = {
        name: 'Jam',
        sugar: 14.0,
        calories: 120,
        measurement_basis: 'per_serving',
        verification_status: 'verified',
      };
      const result = fitsProfile(product, 'diabetic');
      expect(result.fits).toBe(false);
      expect(result.reason).toContain('Over 5g sugar');
    });

    it('marks products with missing nutrients as unknown and unfit', () => {
      const product = {
        name: 'Mystery Bar',
        sugar: null,
        calories: 120,
        measurement_basis: 'per_serving',
        verification_status: 'verified',
      };
      const result = fitsProfile(product, 'diabetic');
      expect(result.fits).toBe(false);
      expect(result.isUnknown).toBe(true);
      expect(result.reason).toContain('Missing sugar');
    });

    it('rejects unverified records from fit verdict', () => {
      const product = {
        name: 'Unverified Shake',
        sugar: 1.0,
        calories: 100,
        verification_status: 'unverified_unknown',
      };
      const result = fitsProfile(product, 'diabetic');
      expect(result.fits).toBe(false);
      expect(result.isUnknown).toBe(true);
    });
  });

  describe('topNutrientTags', () => {
    it('returns top weighted tags for condition', () => {
      const product = {
        protein: 15.0,
        sugar: 1.0,
        fiber: 4.5,
        calories: 180,
        measurement_basis: 'per_serving',
      };
      const tags = topNutrientTags(product, 'diabetic', 2);
      expect(tags.length).toBe(2);
      expect(tags).toContain('Sugar 1g');
    });
  });

  describe('ProfileContext', () => {
    it('updates condition, clamps household and persists to localStorage', () => {
      const { result } = renderHook(() => useProfile(), {
        wrapper: ProfileProvider,
      });

      expect(result.current.profile.condition).toBeNull();
      expect(result.current.profile.household).toBe(2);

      act(() => {
        result.current.setCondition('diabetic');
        result.current.setHousehold(15); // should clamp to 10
      });

      expect(result.current.profile.condition).toBe('diabetic');
      expect(result.current.profile.household).toBe(10);

      const saved = JSON.parse(localStorage.getItem('nk.profile'));
      expect(saved.condition).toBe('diabetic');
      expect(saved.household).toBe(10);
    });
  });
});
