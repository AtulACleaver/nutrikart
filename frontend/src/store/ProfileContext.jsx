import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfileRules } from '../api/catalog';
import { fitsProfile, topNutrientTags, misfitReason } from '../utils/healthLimits';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'nk.profile';

const DEFAULT_PROFILE = {
  condition: null, // "diabetic" | "hypertension" | "weight_loss" | null
  budget: 500,
  household: 2,
  showAll: false,
};

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // Fallback to defaults on parse error
    }
    return DEFAULT_PROFILE;
  });

  const [rules, setRules] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Unable to persist profile to localStorage', e);
    }
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    getProfileRules()
      .then((data) => {
        if (isMounted) setRules(data);
      })
      .catch((err) => {
        console.warn('Unable to fetch remote profile rules, using local defaults', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const setCondition = useCallback((condition) => {
    setProfileState((prev) => ({ ...prev, condition }));
  }, []);

  const setBudget = useCallback((budget) => {
    setProfileState((prev) => ({ ...prev, budget: Math.max(1, Number(budget) || 1) }));
  }, []);

  const setHousehold = useCallback((household) => {
    setProfileState((prev) => ({
      ...prev,
      household: Math.max(1, Math.min(10, Number(household) || 1)),
    }));
  }, []);

  const setShowAll = useCallback((showAll) => {
    setProfileState((prev) => ({ ...prev, showAll: Boolean(showAll) }));
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const evaluateProduct = useCallback(
    (product) => fitsProfile(product, profile.condition),
    [profile.condition]
  );

  const getTags = useCallback(
    (product, n = 2) => topNutrientTags(product, profile.condition, n),
    [profile.condition]
  );

  const getMisfitReason = useCallback(
    (product) => misfitReason(product, profile.condition),
    [profile.condition]
  );

  const value = {
    profile,
    rules,
    setCondition,
    setBudget,
    setHousehold,
    setShowAll,
    clearProfile,
    evaluateProduct,
    getTags,
    getMisfitReason,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileProvider;
