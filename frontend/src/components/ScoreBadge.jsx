import React from "react";

// Color-coded score pill for recommendation items adhering to Organic palette tokens.
// Score thresholds: 80+ sage-700, 60+ sage-600, 40+ neutral-600, below 40 terracotta-700.
export default function ScoreBadge({ score }) {
  let styleClass = "bg-[var(--color-terracotta-700,#8c491a)] text-[#fff2eb]";
  if (score >= 80) {
    styleClass = "bg-[var(--color-sage-700,#56633f)] text-[#f0fae1]";
  } else if (score >= 60) {
    styleClass = "bg-[var(--color-sage-800,#3d472b)] text-[#f0fae1]";
  } else if (score >= 40) {
    styleClass = "bg-[var(--color-neutral-700,#645c50)] text-[#f9f4ed]";
  }

  return (
    <span className={`${styleClass} text-[11px] font-bold px-2 py-0.5 rounded-full`}>
      {score}
    </span>
  );
}
