import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, UserPlus } from "lucide-react";
import { useProfile } from "../store/ProfileContext";

const CONDITION_TITLES = {
  diabetic: "Diabetic-Friendly",
  hypertension: "Hypertension-Conscious",
  weight_loss: "Weight Management",
};

export default function FitVerdict({ product, onOpenProfile }) {
  const { profile, evaluateProduct, getMisfitReason } = useProfile();

  if (!profile.condition) {
    return (
      <div className="p-5 md:p-6 rounded-[32px] bg-[var(--color-surface,#ebddc5)] border border-[var(--color-divider)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-full bg-[var(--color-neutral-300,#ded5c3)] text-[var(--color-ink,#201e1d)] flex items-center justify-center shrink-0">
            <UserPlus size={20} strokeWidth={2.5} />
          </span>
          <div>
            <div className="font-['Caprasimo',serif] text-[18px] md:text-[20px] text-[var(--color-ink,#201e1d)]">
              Health Profile
            </div>
            <p className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
              Set your diet preference to check nutritional fit.
            </p>
          </div>
        </div>
        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="shrink-0 px-4 py-2 rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] text-[13px] font-bold hover:bg-[var(--color-sage-800,#3d472b)] transition-colors cursor-pointer"
          >
            Set profile
          </button>
        )}
      </div>
    );
  }

  const conditionTitle = CONDITION_TITLES[profile.condition] || profile.condition;
  const evaluation = evaluateProduct(product);
  const misfitReason = getMisfitReason(product);

  // Unknown state (missing nutrients or unverified status)
  if (evaluation.isUnknown) {
    return (
      <div className="p-5 md:p-6 rounded-[32px] bg-[var(--color-neutral-100,#f9f4ed)] border border-[var(--color-neutral-300,#ded5c3)] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[var(--color-neutral-300,#ded5c3)] text-[var(--color-neutral-800,#4a4439)] flex items-center justify-center shrink-0">
            <HelpCircle size={20} strokeWidth={2.75} />
          </span>
          <div>
            <h3 className="font-['Caprasimo',serif] text-[20px] md:text-[22px] text-[var(--color-ink,#201e1d)] leading-tight">
              Nutritional info pending
            </h3>
            <p className="text-[13px] text-[var(--color-neutral-700,#645c50)]">
              Detailed values are being verified for this item.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fits state
  if (evaluation.fits) {
    return (
      <div className="p-5 md:p-6 rounded-[32px] bg-[var(--color-sage-100,#f0fae1)] border border-[var(--color-sage-300,#ccdbb2)] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[var(--color-sage-700,#56633f)] text-[var(--color-ground,#f5ead8)] flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} strokeWidth={2.75} />
          </span>
          <div>
            <h3 className="font-['Caprasimo',serif] text-[20px] md:text-[22px] text-[var(--color-sage-900,#272e1b)] leading-tight">
              Fits your {conditionTitle} profile
            </h3>
            <p className="text-[13px] text-[var(--color-sage-800,#3d472b)]">
              Within recommended dietary limits.
            </p>
          </div>
        </div>

        {/* Limit bars */}
        {evaluation.checks && evaluation.checks.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-[var(--color-sage-200,#e1eecc)]">
            {evaluation.checks.map(({ nutrient, value, limit }) => {
              const val = Number(value || 0);
              const ratio = Math.min(1, val / limit);
              const percent = Math.round(ratio * 100);
              const unit = nutrient === "sodium" ? "mg" : nutrient === "calories" ? "kcal" : "g";

              return (
                <div key={nutrient} className="flex flex-col gap-1 text-[13px]">
                  <div className="flex justify-between items-center text-[var(--color-sage-900,#272e1b)] font-medium">
                    <span className="capitalize">{nutrient.replace("_", " ")}</span>
                    <span>
                      <strong>{val}</strong> / {limit} {unit}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--color-sage-200,#e1eecc)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-sage-700,#56633f)] rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Doesn't fit state
  return (
    <div className="p-5 md:p-6 rounded-[32px] bg-[var(--color-terracotta-100,#fdf1e8)] border border-[var(--color-terracotta-200,#fac5a7)] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-[var(--color-terracotta-700,#8c491a)] text-[var(--color-ground,#f5ead8)] flex items-center justify-center shrink-0">
          <AlertCircle size={20} strokeWidth={2.75} />
        </span>
        <div>
          <h3 className="font-['Caprasimo',serif] text-[20px] md:text-[22px] text-[var(--color-terracotta-900,#4a2107)] leading-tight">
            Doesn't fit {conditionTitle}
          </h3>
          <p className="text-[13px] text-[var(--color-terracotta-800,#71360f)]">
            {misfitReason || "Exceeds recommended guidelines for this profile."}
          </p>
        </div>
      </div>

      {evaluation.checks && evaluation.checks.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-[var(--color-terracotta-200,#fac5a7)]">
          {evaluation.checks.map(({ nutrient, value, limit, ok }) => {
            const val = Number(value || 0);
            const exceeds = !ok;
            const ratio = Math.min(1, val / limit);
            const percent = Math.round(ratio * 100);
            const unit = nutrient === "sodium" ? "mg" : nutrient === "calories" ? "kcal" : "g";

            return (
              <div key={nutrient} className="flex flex-col gap-1 text-[13px]">
                <div
                  className={`flex justify-between items-center font-medium ${
                    exceeds ? "text-[var(--color-terracotta-900,#4a2107)] font-bold" : "text-[var(--color-neutral-800,#4a4439)]"
                  }`}
                >
                  <span className="capitalize">{nutrient.replace("_", " ")} {exceeds ? "(Exceeds limit)" : ""}</span>
                  <span>
                    <strong>{val}</strong> / {limit} {unit}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--color-neutral-200,#eee7db)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      exceeds ? "bg-[var(--color-terracotta-700,#8c491a)]" : "bg-[var(--color-neutral-400,#c0b6a5)]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
