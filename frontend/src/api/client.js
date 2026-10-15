import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
	// Render free instances sleep when idle and take ~50s to wake up on cold start.
	timeout: 60000,
});