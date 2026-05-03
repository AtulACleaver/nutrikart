import axios from "axios";

let fixtureMode = import.meta.env.VITE_USE_FIXTURES === "true";

export const setFixtureMode = (val) => {
  fixtureMode = Boolean(val);
};

export const isFixtureMode = () => fixtureMode;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  // Render free instances sleep when idle and take ~50s to wake up on cold start.
  timeout: 60000,
});
