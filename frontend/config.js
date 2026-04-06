// ─────────────────────────────────────────────────────────
// config.js — Single source of truth for API base URL
// Auto-detects local dev vs production (Render)
// Include this in every HTML page BEFORE any API calls
// ─────────────────────────────────────────────────────────

const API_BASE_URL = window.location.hostname === "localhost" ||
                     window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : "https://ai-placement-ihu6.onrender.com";

// Expose as both names used across your files
const API      = API_BASE_URL + "/api";
const API_BASE = API_BASE_URL + "/api";

console.log("🌐 API:", API_BASE_URL);