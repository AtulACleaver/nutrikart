import React from "react";
import { Tag } from "./ui";
import { useProfile } from "../store/ProfileContext";
import { SCORING_WEIGHTS } from "../utils/healthLimits";

export default function NutritionTable({ product }) {
  const { profile } = useProfile();
  const weights = profile.condition ? (SCORING_WEIGHTS[profile.condition] || SCORING_WEIGHTS.default) : null;

  const nutrients = [
    { key: "calories", label: "Calories", val: product.calories, unit: "kcal" },
    { key: "sugar", label: "Sugar", val: product.sugar, unit: "g" },
    { key: "sodium", label: "Sodium", val: product.sodium, unit: "mg" },
    { key: "protein", label: "Protein", val: product.protein, unit: "g" },
    { key: "fat", label: "Total Fat", val: product.fat, unit: "g" },
    { key: "sat_fat", label: "Saturated Fat", val: product.sat_fat ?? product.saturated_fat, unit: "g" },
    { key: "fiber", label: "Fiber", val: product.fiber, unit: "g" },
    { key: "serving_size", label: "Serving Size", val: product.serving_size, unit: "g" },
  ];

  const getWeightTag = (key) => {
    if (!weights) return null;
    const w = weights[key];
    if (w === undefined || w === null) {
      return <Tag tone="neutral">Not weighted</Tag>;
    }
    if (w >= 2.0) {
      return <Tag tone="sage">Counts for, strongly</Tag>;
    }
    if (w > 0) {
      return <Tag tone="sage">Counts for</Tag>;
    }
    return <Tag tone="terracotta">Counts against</Tag>;
  };

  return (
    <div className="w-full rounded-[28px] bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] p-5 md:p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--color-divider)]">
        <h3 className="font-['Caprasimo',serif] text-[18px] md:text-[20px] text-[var(--color-ink,#201e1d)]">
          Nutrition Facts
        </h3>
        <span className="text-[12px] font-semibold text-[var(--color-neutral-700,#645c50)]">
          Basis: {product.measurement_basis ? product.measurement_basis.replace("_", " ") : "per serving"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[var(--color-divider)] text-[11px] font-bold uppercase tracking-wider text-[var(--color-neutral-700,#645c50)]">
              <th className="py-2.5 pr-4 font-semibold">Nutrient</th>
              <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              {profile.condition && (
                <th className="py-2.5 pl-4 font-semibold text-right">For profile</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-divider)]">
            {nutrients.map(({ key, label, val, unit }) => (
              <tr key={key} className="hover:bg-[color-mix(in_srgb,var(--color-ink,#201e1d)_2%,transparent)] transition-colors">
                <td className="py-2.5 pr-4 text-[var(--color-ink,#201e1d)] font-medium">
                  {label}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-[var(--color-ink,#201e1d)]">
                  {val != null ? val : "—"}{val != null ? ` ${unit}` : ""}
                </td>
                {profile.condition && (
                  <td className="py-2.5 pl-4 text-right">
                    {key === "serving_size" ? "—" : getWeightTag(key)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
