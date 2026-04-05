// frontend/js/auth-refresh.js
// ─────────────────────────────────────────────────────────────────
// Include this script on EVERY page via <script src="js/auth-refresh.js">
// It silently refreshes the Supabase token before it expires.
// ─────────────────────────────────────────────────────────────────

(async function initAuthRefresh() {
    const SUPA_URL  = "https://tbbjseuniixtofxnglgn.supabase.co";
    const SUPA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYmpzZXVuaWl4dG9meG5nbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODM2NTQsImV4cCI6MjA4OTA1OTY1NH0.W105azTILfUkD0Ufu0weV_uZFxlbOIdxJtJeLlyTSYQ";
    const PUBLIC_PAGES = ["/login.html", "/signup.html", "/confirm-email.html", "/reset-password.html", "/login", "/signup"];

    // Don't run on public pages
    const currentPath = window.location.pathname;
    if (PUBLIC_PAGES.some(p => currentPath.endsWith(p)) || currentPath === "/") return;

    // Load Supabase SDK if not loaded yet
    async function loadSDK() {
        if (window.supabase) return window.supabase;
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
            s.onload = () => resolve(window.supabase);
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function refreshToken() {
        try {
            const supabaseLib = await loadSDK();
            const sb = supabaseLib.createClient(SUPA_URL, SUPA_ANON);

            const storedToken   = localStorage.getItem("token");
            const refreshToken  = localStorage.getItem("refreshToken");

            if (!storedToken || !refreshToken) return false;

            // Try to set session — if token is expired, use refresh token
            const { data, error } = await sb.auth.setSession({
                access_token:  storedToken,
                refresh_token: refreshToken
            });

            if (error) {
                // Try refreshing directly
                const { data: refreshData, error: refreshError } = await sb.auth.refreshSession({
                    refresh_token: refreshToken
                });

                if (refreshError || !refreshData?.session) {
                    console.warn("Auth: Session expired, redirecting to login");
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login.html";
                    return false;
                }

                // Save new tokens
                localStorage.setItem("token", refreshData.session.access_token);
                localStorage.setItem("refreshToken", refreshData.session.refresh_token);
                console.log("✅ Auth: Token refreshed successfully");
                return true;
            }

            if (data?.session) {
                // Update tokens if they changed
                if (data.session.access_token !== storedToken) {
                    localStorage.setItem("token", data.session.access_token);
                    localStorage.setItem("refreshToken", data.session.refresh_token);
                    console.log("✅ Auth: Token updated");
                }
                return true;
            }

        } catch(e) {
            console.warn("Auth refresh error:", e.message);
        }
        return false;
    }

    // Check if token is expired by decoding JWT
    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry  = payload.exp * 1000; // convert to ms
            const now     = Date.now();
            const buffer  = 5 * 60 * 1000; // refresh 5 min before expiry
            return now >= (expiry - buffer);
        } catch { return true; }
    }

    // On page load: check and refresh if needed
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    if (isTokenExpired(token)) {
        console.log("Auth: Token expired or near expiry, refreshing...");
        await refreshToken();
    }

    // Set up auto-refresh every 45 minutes
    setInterval(async () => {
        const t = localStorage.getItem("token");
        if (t && isTokenExpired(t)) {
            console.log("Auth: Scheduled token refresh...");
            await refreshToken();
        }
    }, 45 * 60 * 1000);

})();