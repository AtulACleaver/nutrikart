/**
 * Client-side health limits and evaluation helpers.
 * Synchronized directly with backend/app/recommendation.py to eliminate configuration drift.
 */

export const HEALTH_CONSTRAINTS = {
  diabetic: {
    sugar_max: 5.0,
    calorie_max: 200.0,
  },
  hypertension: {
    sodium_max: 200.0,
    fat_max: 5.0,
  },
  weight_loss: {
    calorie_max: 150.0,
    saturated_fat_max: 3.0,
    sugar_max: 8.0,
  },
};

export const CONSTRAINT_FIELD_MAP = {
  sugar_max: "sugar",
  calorie_max: "calories",
  sodium_max: "sodium",
  fat_max: "fat",
  saturated_fat_max: "sat_fat",
};

export const SCORING_WEIGHTS = {
  diabetic: {
    sugar: -3.0,
    fiber: 2.0,
    protein: 1.5,
    sodium: -0.5,
    calories: -0.5,
  },
  hypertension: {
    sodium: -4.0,
    fat: -2.0,
    saturated_fat: -2.5,
    fiber: 1.5,
    protein: 1.0,
    sugar: -1.0,
  },
  weight_loss: {
    calories: -3.0,
    saturated_fat: -2.5,
    sugar: -2.0,
    protein: 2.5,
    fiber: 2.0,
    fat: -1.0,
  },
  default: {
    protein: 1.5,
    fiber: 1.5,
    sugar: -1.0,
    sodium: -0.5,
    saturated_fat: -1.0,
    calories: -0.3,
  },
};

/**
 * Normalizes nutrient value per serving based on measurement_basis and serving size.
 */
export function getNormalizedNutrient(product, field) {
  if (!product) return null;

  // Support alternate field name mappings
  const rawVal = product[field] ?? (field === "sat_fat" ? product.saturated_fat : null);
  if (rawVal === null || rawVal === undefined) return null;

  const basis = product.measurement_basis || "per_serving";
  if (basis === "per_serving") {
    return Number(rawVal);
  }

  if (basis === "per_100g" || basis === "per_100ml") {
    const servingSize = Number(product.serving_size);
    if (!servingSize || servingSize <= 0) return null;
    return Number(((Number(rawVal) * servingSize) / 100).toFixed(2));
  }

  return null;
}

/**
 * Evaluates whether a product strictly conforms to a health condition's constraints.
 * Unknown or unverified nutrients disqualify products from fit status to prevent false claims.
 */
export function fitsProfile(product, condition) {
  if (!condition || !HEALTH_CONSTRAINTS[condition]) {
    return { fits: true, isUnknown: false, checks: [] };
  }

  if (product.verification_status === "unverified_unknown") {
    return {
      fits: false,
      isUnknown: true,
      reason: "Unverified nutritional data",
      checks: [],
    };
  }

  const constraints = HEALTH_CONSTRAINTS[condition];
  const checks = [];
  let isUnknown = false;
  let fits = true;
  let firstFailingReason = null;

  for (const [constraintKey, maxVal] of Object.entries(constraints)) {
    const fieldName = CONSTRAINT_FIELD_MAP[constraintKey];
    const val = getNormalizedNutrient(product, fieldName);

    if (val === null || val === undefined) {
      isUnknown = true;
      fits = false;
      if (!firstFailingReason) {
        firstFailingReason = `Missing ${fieldName.replace("_", " ")}`;
      }
      checks.push({
        nutrient: fieldName,
        value: null,
        limit: maxVal,
        ok: false,
        missing: true,
      });
      break;
    }

    const ok = val <= maxVal;
    if (!ok) {
      fits = false;
      if (!firstFailingReason) {
        const unit = constraintKey.includes("sodium") ? "mg" : (constraintKey.includes("calorie") ? "kcal" : "g");
        firstFailingReason = `Over ${maxVal}${unit} ${fieldName.replace("_", " ")}`;
      }
    }

    checks.push({
      nutrient: fieldName,
      value: val,
      limit: maxVal,
      ok,
      missing: false,
    });
  }

  return {
    fits,
    isUnknown,
    reason: firstFailingReason,
    checks,
  };
}

/**
 * Returns the n top influential nutrient tags for the condition.
 */
export function topNutrientTags(product, condition, n = 2) {
  if (!product) return [];

  const weights = SCORING_WEIGHTS[condition] || SCORING_WEIGHTS.default;
  const sortedKeys = Object.keys(weights).sort(
    (a, b) => Math.abs(weights[b]) - Math.abs(weights[a])
  );

  const tags = [];
  for (const key of sortedKeys) {
    const field = key === "saturated_fat" ? "sat_fat" : key;
    const val = getNormalizedNutrient(product, field);
    if (val !== null && val !== undefined) {
      const label = key === "calories" ? `${Math.round(val)} kcal` : `${key.charAt(0).toUpperCase() + key.slice(1)} ${val}g`;
      tags.push(label);
      if (tags.length >= n) break;
    }
  }

  return tags;
}

/**
 * Returns the short label explanation why a product did not fit a profile.
 */
export function misfitReason(product, condition) {
  const result = fitsProfile(product, condition);
  return result.reason || null;
}
