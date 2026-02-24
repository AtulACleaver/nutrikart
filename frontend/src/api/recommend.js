import { api } from "./client";

export const getRecommendations = async (payload) => {
  return (await api.post("/recommend", payload)).data;
};
