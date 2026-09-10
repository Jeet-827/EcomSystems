// Automatically detect local vs deployed environment
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const getApiUrl = (envUrl, defaultLocalPort) => {
  // If an explicit external URL is set (e.g. separate backend deployment), use it
  if (envUrl && envUrl.trim() !== "" && !envUrl.includes("localhost")) {
    return envUrl.trim();
  }
  // On deployed domain (Vercel, etc.) — use relative paths so /api/... hits the same domain
  if (!isLocalhost) {
    return "";
  }
  // Local development
  return `http://localhost:${defaultLocalPort}`;
};

export const API_BASE_URL = getApiUrl(import.meta.env.VITE_API_URL, 5000);
// Admin server runs on port 8000 (separate from Backend port 5000)
export const ADMIN_API_BASE_URL = getApiUrl(import.meta.env.VITE_ADMIN_API_URL, 8000);
