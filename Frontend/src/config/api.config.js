// Automatically detect local vs deployed environment (Vercel, Render, etc.)
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const getApiUrl = (envUrl, defaultLocalPort) => {
  // Use explicitly set backend URL if provided (e.g. https://your-backend.onrender.com)
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  // On deployed domain (Vercel etc.) with no explicit URL, use relative path ""
  if (!isLocalhost) {
    return "";
  }
  // Local development fallback
  return `http://localhost:${defaultLocalPort}`;
};

export const API_BASE_URL = getApiUrl(import.meta.env.VITE_API_URL, 5000);
export const ADMIN_API_BASE_URL = getApiUrl(import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL, 5000);
