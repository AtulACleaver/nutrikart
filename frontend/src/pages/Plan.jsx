import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import ConditionPicker from '../components/ConditionPicker';
import BudgetField from '../components/BudgetField';
import PlanResult from '../components/PlanResult';
import { QtyStepper, Button, EmptyState, Skeleton } from '../components/ui';
import { useProfile } from '../store/ProfileContext';
import { getRecommendations } from '../api/recommend';
import { formatPrice } from '../utils/formatPrice';
import { AlertCircle, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function Plan() {
  const { profile, setCondition, setBudget, setHousehold } = useProfile();

  const [requestState, setRequestState] = useState('idle'); // 'idle' | 'loading' | 'result' | 'empty' | 'error'
  const [isSlow, setIsSlow] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [planResult, setPlanResult] = useState(null);

  const slowTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const formRef = useRef(null);

  const isBudgetValid = profile.budget >= 50;

  useEffect(() => {
    return () => {
      clearTimeout(slowTimerRef.current);
      clearTimeout(timeoutTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGeneratePlan = async (e) => {
    if (e) e.preventDefault();
    if (!isBudgetValid) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearTimeout(slowTimerRef.current);
    clearTimeout(timeoutTimerRef.current);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setRequestState('loading');
    setIsSlow(false);
    setErrorMessage(null);

    // 4 second slow progress disclosure
    slowTimerRef.current = setTimeout(() => {
      setIsSlow(true);
    }, 4000);

    // 45 second client cancellation timeout
    timeoutTimerRef.current = setTimeout(() => {
      controller.abort();
      setRequestState('error');
      setErrorMessage('The request timed out after 45 seconds. The server may be waking up.');
    }, 45000);

    try {
      const payload = {
        budget: profile.budget,
        health_condition: profile.condition,
        household_size: profile.household,
      };

      const data = await getRecommendations(payload, { signal: controller.signal });

      clearTimeout(slowTimerRef.current);
      clearTimeout(timeoutTimerRef.current);

      if (!data.recommendations || data.recommendations.length === 0) {
        setPlanResult(data);
        setRequestState('empty');
      } else {
        setPlanResult(data);
        setRequestState('result');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      clearTimeout(slowTimerRef.current);
      clearTimeout(timeoutTimerRef.current);

      setRequestState('error');
      const isNetworkDrop = typeof navigator !== 'undefined' && !navigator.onLine;
      setErrorMessage(
        isNetworkDrop
          ? 'Network connection lost. Please check your internet connection and retry.'
          : err.response?.data?.detail || err.message || 'Server error while calculating optimal plan.'
      );
    }
  };

  const handleResetToForm = () => {
    setRequestState('idle');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <AppLayout>
      <div className="py-8 md:py-12">
        {/* Header Hero */}
        <div className="max-w-[760px] mb-8 md:mb-12">
          <h1 className="font-['Caprasimo',serif] text-[34px] sm:text-[40px] md:text-[48px] text-[var(--color-ink,#201e1d)] leading-[1.05] mb-4">
            Kitchen Planner
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--color-neutral-800,#474238)] leading-relaxed">
            Configure your household grocery plan. Our optimization engine fits whole-food baskets to verified nutrient criteria and real budgets.
          </p>
        </div>

        {/* Form Card (always retains user inputs) */}
        <form
          ref={formRef}
          onSubmit={handleGeneratePlan}
          className="bg-[var(--color-surface,#ebddc5)]/60 rounded-[36px] border border-[var(--color-divider)] p-6 md:p-10 shadow-sm flex flex-col gap-8 max-w-[840px] mb-12"
        >
          {/* Step 1: Health Condition Selection */}
          <section aria-labelledby="condition-step-title">
            <div className="mb-4">
              <h2
                id="condition-step-title"
                className="font-['Caprasimo',serif] text-[22px] md:text-[24px] text-[var(--color-ink,#201e1d)]"
              >
                1. Dietary Guidelines
              </h2>
              <p className="text-[14px] text-[var(--color-neutral-700,#645c50)]">
                Select public dietary limits to apply to your candidate grocery basket.
              </p>
            </div>
            <ConditionPicker
              value={profile.condition}
              onChange={setCondition}
              variant="cards"
            />
          </section>

          {/* Step 2: Budget & Household */}
          <section aria-labelledby="parameters-step-title" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--color-divider)]">
            <div className="flex flex-col justify-between">
              <BudgetField
                value={profile.budget}
                onChange={setBudget}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="household-stepper"
                  className="font-bold text-[15px] text-[var(--color-ink,#201e1d)]"
                >
                  Household Size
                </label>
                <span className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
                  Portions scaled per person
                </span>
              </div>

              <div className="h-[64px] px-6 rounded-2xl bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] flex items-center justify-between">
                <span className="font-['Caprasimo',serif] text-[20px] text-[var(--color-ink,#201e1d)]">
                  {profile.household} {profile.household === 1 ? 'Person' : 'People'}
                </span>
                <QtyStepper
                  value={profile.household}
                  min={1}
                  max={10}
                  size="md"
                  onChange={setHousehold}
                  ariaLabel="Household size stepper"
                />
              </div>

              <p className="text-[12px] text-[var(--color-neutral-700,#645c50)]">
                Guarantees proportional integer unit allocations across 1 to 10 family members.
              </p>
            </div>
          </section>

          {/* Form Footer */}
          <footer className="pt-6 border-t border-[var(--color-divider)] flex flex-col sm:flex-row items-center justify-between gap-5">
            <Button
              type="submit"
              variant="plan"
              size="xl"
              disabled={!isBudgetValid || requestState === 'loading'}
              className="w-full sm:w-auto"
            >
              {requestState === 'loading' ? 'Optimizing basket...' : 'Generate kitchen plan'}
            </Button>

            <p className="text-[12px] text-[var(--color-neutral-700,#645c50)] leading-tight text-center sm:text-right max-w-[340px]">
              Applies heuristic nutrient limits to verified food data. Not clinical advice.
            </p>
          </footer>
        </form>

        {/* Dynamic Request States Section */}
        <section aria-live="polite" className="max-w-[840px]">
          {/* Loading State */}
          {requestState === 'loading' && (
            <div className="p-8 rounded-[36px] bg-[var(--color-surface,#ebddc5)]/40 border border-[var(--color-divider)] flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-[var(--color-sage-700,#56633f)] animate-spin" />
                <h3 className="font-['Caprasimo',serif] text-[22px] text-[var(--color-ink,#201e1d)]">
                  Assembling optimal basket...
                </h3>
              </div>

              {isSlow && (
                <div className="p-4 rounded-2xl bg-[var(--color-sage-100,#f0fae1)] text-[var(--color-sage-900,#272e1b)] text-[14px] leading-relaxed">
                  Crunching nutritional fits and integer unit prices... (free-tier servers may take a moment to wake up).
                </div>
              )}

              <div className="space-y-4">
                <Skeleton height="56px" radius="rounded-2xl" />
                <Skeleton height="56px" radius="rounded-2xl" />
                <Skeleton height="56px" radius="rounded-2xl" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {requestState === 'empty' && (
            <div className="p-8 rounded-[36px] bg-[var(--color-surface,#ebddc5)]/40 border border-[var(--color-divider)]">
              <EmptyState
                tone="terracotta"
                title={`No basket matches ${formatPrice(profile.budget)}`}
                body={
                  planResult?.summary?.message ||
                  'The combination of dietary limits and budget was too tight to allocate minimum whole-household quantities. Try increasing your budget or adjusting dietary limits.'
                }
                primaryAction={
                  <Button variant="secondary" size="md" onClick={handleResetToForm}>
                    <SlidersHorizontal size={16} strokeWidth={2.75} />
                    Adjust inputs
                  </Button>
                }
              />
            </div>
          )}

          {/* Error State */}
          {requestState === 'error' && (
            <div className="p-8 rounded-[36px] bg-[var(--color-surface,#ebddc5)]/40 border border-[var(--color-divider)]">
              <EmptyState
                tone="terracotta"
                title="Could not generate plan"
                body={errorMessage || 'An unexpected error occurred while calculating recommendations.'}
                primaryAction={
                  <Button variant="plan" size="md" onClick={handleGeneratePlan}>
                    <RotateCcw size={16} strokeWidth={2.75} />
                    Retry
                  </Button>
                }
                secondaryAction={
                  <Button variant="secondary" size="md" onClick={handleResetToForm}>
                    Edit parameters
                  </Button>
                }
              />
            </div>
          )}

          {/* Result State with Editable PlanResult */}
          {requestState === 'result' && planResult && (
            <PlanResult
              result={planResult}
              onEditPlan={handleResetToForm}
            />
          )}
        </section>
      </div>
    </AppLayout>
  );
}
