import React from "react";
import { Link } from "react-router-dom";
import { Filter, Award, Calculator, ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";
import AppLayout from "../components/AppLayout";
import { Button, Tag } from "../components/ui";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      icon: <Filter size={20} strokeWidth={2.5} />,
      title: "Filter by health guidelines",
      description:
        "Choose an optional dietary goal like Diabetic-Friendly or Hypertension-Conscious. Any items that exceed standard nutrient thresholds (like added sugars or high sodium) are automatically filtered out.",
    },
    {
      num: "2",
      icon: <Award size={20} strokeWidth={2.5} />,
      title: "Score nutritional balance",
      description:
        "Every food is evaluated per serving. Wholesome nutrients like dietary fiber and protein earn positive score weight, while excess sodium, added sugars, and saturated fats reduce the score.",
    },
    {
      num: "3",
      icon: <Calculator size={20} strokeWidth={2.5} />,
      title: "Optimize to your budget",
      description:
        "Our planner selects the best combination of whole-household groceries that maximizes total nutritional density while staying strictly within your spending limit.",
    },
  ];

  const profiles = [
    {
      title: "Diabetic-Friendly",
      limits: "≤ 5g sugar, ≤ 200 kcal per serving",
      summary: "Filters out high-glycemic foods with heavy added sugars, prioritizing complex fibers and steady energy sources.",
    },
    {
      title: "Hypertension-Conscious",
      limits: "≤ 200mg sodium, ≤ 5g fat per serving",
      summary: "Restricts high-sodium foods and heavy saturated fats to help support cardiovascular and blood pressure health.",
    },
    {
      title: "Weight Management",
      limits: "≤ 150 kcal, ≤ 3g sat-fat per serving",
      summary: "Focuses on lower calorie density and minimal saturated fat while keeping protein and fiber high for satiety.",
    },
    {
      title: "All Foods",
      limits: "Balanced nutrition across full catalogue",
      summary: "No heuristic exclusions. Optimizes your basket purely for maximum protein, fiber density, and category variety.",
    },
  ];

  return (
    <AppLayout>
      <div className="py-8 md:py-12 max-w-[920px] mx-auto flex flex-col gap-12 md:gap-16">
        {/* Hero Section */}
        <div className="text-left">
          <div className="mb-3">
            <Tag tone="sage">NutriKart Planning System</Tag>
          </div>
          <h1 className="font-['Caprasimo',serif] text-[30px] sm:text-[36px] md:text-[42px] text-[var(--color-ink,#201e1d)] leading-tight mb-4">
            How NutriKart Works
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--color-neutral-800,#474238)] leading-relaxed max-w-[700px]">
            A transparent, whole-food approach to grocery shopping. We combine public dietary limits with budget-aware optimization so you can feed your household healthily.
          </p>
        </div>

        {/* 3 Step Flow */}
        <section aria-labelledby="steps-heading">
          <h2
            id="steps-heading"
            className="font-['Caprasimo',serif] text-[22px] md:text-[26px] text-[var(--color-ink,#201e1d)] mb-6"
          >
            The 3-Step Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-[28px] bg-[var(--color-surface,#ebddc5)]/70 border border-[var(--color-divider)] flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] font-['Caprasimo',serif] text-[18px] flex items-center justify-center">
                    {step.num}
                  </span>
                  <span className="text-[var(--color-sage-700,#56633f)]">
                    {step.icon}
                  </span>
                </div>

                <div>
                  <h3 className="font-['Caprasimo',serif] text-[18px] text-[var(--color-ink,#201e1d)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[var(--color-neutral-800,#474238)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dietary Profiles Breakdown */}
        <section aria-labelledby="profiles-heading">
          <h2
            id="profiles-heading"
            className="font-['Caprasimo',serif] text-[22px] md:text-[26px] text-[var(--color-ink,#201e1d)] mb-6"
          >
            Dietary Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((p) => (
              <div
                key={p.title}
                className="p-5 rounded-[24px] bg-[var(--color-surface,#ebddc5)]/50 border border-[var(--color-divider)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-['Caprasimo',serif] text-[17px] text-[var(--color-ink,#201e1d)]">
                    {p.title}
                  </h3>
                  <span className="text-[12px] font-bold text-[var(--color-sage-800,#3d472b)] bg-[var(--color-sage-200,#e1eecc)] px-2.5 py-0.5 rounded-full">
                    {p.limits}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-neutral-800,#474238)] leading-snug">
                  {p.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantees & Transparency */}
        <section className="p-6 md:p-8 rounded-[32px] bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] flex flex-col sm:flex-row gap-6 items-start">
          <span className="w-12 h-12 rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] flex items-center justify-center shrink-0">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </span>
          <div className="space-y-2">
            <h3 className="font-['Caprasimo',serif] text-[20px] text-[var(--color-ink,#201e1d)]">
              Independent, Transparent Data
            </h3>
            <p className="text-[14px] text-[var(--color-neutral-800,#474238)] leading-relaxed">
              We never take manufacturer kickbacks or offer paid shelf placements. All grocery recommendations are calculated strictly by mathematical optimization against publicly published nutrient facts and actual retail prices.
            </p>
            <p className="text-[12px] text-[var(--color-neutral-700,#645c50)] italic pt-1">
              Disclaimer: NutriKart is a nutritional planning tool for educational and grocery management purposes. It is not clinical or medical advice.
            </p>
          </div>
        </section>

        {/* CTA Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[28px] bg-[var(--color-sage-100,#f0fae1)] border border-[var(--color-sage-300,#ccdbb2)]">
          <div>
            <h3 className="font-['Caprasimo',serif] text-[20px] text-[var(--color-sage-900,#272e1b)]">
              Ready to build your kitchen plan?
            </h3>
            <p className="text-[13px] text-[var(--color-sage-800,#3d472b)]">
              Set your budget and dietary preferences to get started in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="plan" size="md" className="w-full sm:w-auto">
                Start kitchen plan
              </Button>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Explore shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

