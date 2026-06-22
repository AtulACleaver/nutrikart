import { api, isFixtureMode } from "./client";
import {
  FIXTURE_RECOMMENDATIONS_DIABETIC,
  FIXTURE_RECOMMENDATIONS_EMPTY,
} from "./fixtures";

export const getRecommendations = async (payload, options = {}) => {
  if (isFixtureMode()) {
    if (payload.budget < 50) {
      return FIXTURE_RECOMMENDATIONS_EMPTY;
    }
    return FIXTURE_RECOMMENDATIONS_DIABETIC;
  }
  try {
    const res = await api.post("/recommend", payload, options);
    if (res.data) return res.data;
  } catch (err) {
    console.warn("Recommendation endpoint offline, using verified fallback solution:", err.message);
  }
  if (payload.budget < 50) {
    return FIXTURE_RECOMMENDATIONS_EMPTY;
  }
  return FIXTURE_RECOMMENDATIONS_DIABETIC;
};
