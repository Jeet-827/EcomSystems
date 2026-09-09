// Automatically detect local environment vs deployed production (e.g. Vercel)
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const getApiUrl = (envUrl, defaultLocalPort) => {
  // 1. If explicit non-localhost custom domain is set in VITE_API_URL, use it
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }
  // 2. If running on a deployed domain (like Vercel) or built for PROD without custom API host, use relative path ""
  if (!isLocalhost || import.meta.env.PROD) {
    return "";
  }
  // 3. In local development (localhost), default to local dev server port
  return `http://localhost:${defaultLocalPort}`;
};

export const API_BASE_URL = getApiUrl(import.meta.env.VITE_API_URL, 5000);
export const ADMIN_API_BASE_URL = getApiUrl(import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL, 5000);
