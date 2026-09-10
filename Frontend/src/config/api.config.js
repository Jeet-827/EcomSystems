// Automatically detect local vs deployed environment
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_PROD_BACKEND_URL = "https://ecomsystems-backend.onrender.com";
const DEFAULT_PROD_ADMIN_URL = "https://ecomsystems-admin.onrender.com";

const getApiUrl = (envUrl, defaultLocalPort, defaultProdUrl) => {
  // If an explicit external URL is set, always use it
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  // Local development fallback
  if (isLocalhost) {
    return `http://localhost:${defaultLocalPort}`;
  }
  // Production fallback on Render (never return empty string on deployed domain)
  return defaultProdUrl;
};

export const API_BASE_URL = getApiUrl(
  import.meta.env.VITE_API_URL,
  5000,
  DEFAULT_PROD_BACKEND_URL
);

// Admin server URL
export const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_URL ||
  (isLocalhost ? "http://localhost:8000" : DEFAULT_PROD_ADMIN_URL)
).trim().replace(/\/+$/, "");


