// Automatically detect local vs deployed environment
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const getApiUrl = (envUrl, defaultLocalPort) => {
  // If an explicit external URL is set, always use it (handles Render separate services)
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  // Local development fallback
  if (isLocalhost) {
    return `http://localhost:${defaultLocalPort}`;
  }
  // Same-domain fallback (for monorepo single-domain deployments)
  return "";
};

export const API_BASE_URL = getApiUrl(import.meta.env.VITE_API_URL, 5000);

// Admin server URL
export const ADMIN_API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_URL || ""
).trim().replace(/\/+$/, "");

