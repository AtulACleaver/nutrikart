import React from 'react';
import AppLayout from '../components/AppLayout';
import ConditionPicker from '../components/ConditionPicker';
import BudgetField from '../components/BudgetField';
import { QtyStepper, Button } from '../components/ui';
import { useProfile } from '../store/ProfileContext';

export default function Plan() {
  const { profile, setCondition, setBudget, setHousehold } = useProfile();

  const isBudgetValid = profile.budget >= 50;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isBudgetValid) return;
    // In prompt 7, recommendation generation is wired up here
    console.log('Generating plan with payload:', {
      budget: profile.budget,
      health_condition: profile.condition,
      household_size: profile.household,
    });
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

        {/* Plan Input Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-surface,#ebddc5)]/60 rounded-[36px] border border-[var(--color-divider)] p-6 md:p-10 shadow-sm flex flex-col gap-8 max-w-[840px]"
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
              disabled={!isBudgetValid}
              className="w-full sm:w-auto"
            >
              Generate kitchen plan
            </Button>

            <p className="text-[12px] text-[var(--color-neutral-700,#645c50)] leading-tight text-center sm:text-right max-w-[340px]">
              Applies heuristic nutrient limits to verified food data. Not clinical advice.
            </p>
          </footer>
        </form>
      </div>
    </AppLayout>
  );
}
