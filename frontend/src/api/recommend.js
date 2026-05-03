import { api, isFixtureMode } from "./client";
import {
  FIXTURE_RECOMMENDATIONS_DIABETIC,
  FIXTURE_RECOMMENDATIONS_EMPTY,
} from "./fixtures";

export const getRecommendations = async (payload) => {
  if (isFixtureMode()) {
    if (payload.budget < 50) {
      return FIXTURE_RECOMMENDATIONS_EMPTY;
    }
    return FIXTURE_RECOMMENDATIONS_DIABETIC;
  }
  return (await api.post("/recommend", payload)).data;
};
