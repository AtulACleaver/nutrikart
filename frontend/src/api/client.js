import axios from "axios";

let fixtureMode = import.meta.env.VITE_USE_FIXTURES === "true";

export const setFixtureMode = (val) => {
  fixtureMode = Boolean(val);
};

export const isFixtureMode = () => fixtureMode;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  // 12s timeout: if Render is sleeping or spinning up, fallback kicks in smoothly
  timeout: 12000,
});
