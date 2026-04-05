// frontend/js/settings.js
// ─────────────────────────────────────────────────────────────────
// Works with Supabase auth — uses Bearer token for all API calls
// Change password uses Supabase JS SDK directly (no backend needed)
// ✅ FIXED: Clear History now properly clears ALL history including ATS
// ─────────────────────────────────────────────────────────────────

// API set globally by config.js
const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

// Supabase client for password change
const SUPA_URL  = "https://tbbjseuniixtofxnglgn.supabase.co";
const SUPA_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiYmpzZXVuaWl4dG9meG5nbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODM2NTQsImV4cCI6MjA4OTA1OTY1NH0.W105azTILfUkD0Ufu0weV_uZFxlbOIdxJtJeLlyTSYQ";

// ── INIT ──────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadNotifications();
    loadSessionInfo();
});

// ── HELPERS ──────────────────────────────────────────────────────
function showSuccess(msg) {
    const el = document.getElementById("alertSuccess");
    const em = document.getElementById("alertError");
    document.getElementById("alertSuccessMsg").textContent = msg;
    em.classList.remove("show");
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
}
function showError(msg) {
    const el = document.getElementById("alertError");
    const es = document.getElementById("alertSuccess");
    document.getElementById("alertErrorMsg").textContent = msg;
    es.classList.remove("show");
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 6000);
    window.scrollTo({ top: 0, behavior: "smooth" });
}
function setBtnLoading(id, loading, text) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Saving…" : text;
}
function initials(name) {
    return name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
}

// ── LOAD PROFILE ─────────────────────────────────────────────────
async function loadProfile() {
    try {
        const res  = await fetch(`${API}/user/profile`, { headers: { "Authorization": "Bearer "+token } });
        const data = await res.json();
        const user = data.user || data;

        // Account bar
        const name = user.name || localStorage.getItem("userName") || "User";
        document.getElementById("acctAv").textContent    = initials(name);
        document.getElementById("acctName").textContent  = name;
        document.getElementById("acctEmail").textContent = user.email || "—";

        // Profile fields
        document.getElementById("profileName").value     = user.name || "";
        document.getElementById("profileEmail").value    = user.email || "";
        document.getElementById("profilePhone").value    = user.phone || "";
        document.getElementById("profileLocation").value = user.location || "";
        document.getElementById("profileRole").value     = user.preferredRole || "";
        document.getElementById("profileSalary").value   = user.expectedSalary || "";
        document.getElementById("profileBio").value      = user.bio || "";

        const expEl = document.getElementById("profileExp");
        if (user.experienceLevel) expEl.value = user.experienceLevel;

    } catch(e) {
        const name = localStorage.getItem("userName") || "User";
        document.getElementById("acctAv").textContent   = initials(name);
        document.getElementById("acctName").textContent = name;
        console.warn("Profile load failed:", e.message);
    }
}

// ── SAVE PROFILE ─────────────────────────────────────────────────
async function saveProfile() {
    setBtnLoading("saveProfileBtn", true);
    try {
        const body = {
            name:            document.getElementById("profileName").value.trim(),
            phone:           document.getElementById("profilePhone").value.trim(),
            location:        document.getElementById("profileLocation").value.trim(),
            preferredRole:   document.getElementById("profileRole").value.trim(),
            experienceLevel: document.getElementById("profileExp").value,
            expectedSalary:  document.getElementById("profileSalary").value.trim(),
            bio:             document.getElementById("profileBio").value.trim(),
        };

        const res = await fetch(`${API}/user/profile`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer "+token },
            body:    JSON.stringify(body)
        });

        if (!res.ok) throw new Error((await res.json()).message || "Failed to save");

        // Update account bar with new name
        if (body.name) {
            document.getElementById("acctAv").textContent   = initials(body.name);
            document.getElementById("acctName").textContent = body.name;
            localStorage.setItem("userName", body.name);
        }

        showSuccess("Profile updated successfully!");
    } catch(e) {
        showError(e.message || "Failed to save profile");
    } finally {
        setBtnLoading("saveProfileBtn", false, "Save Profile");
        document.getElementById("saveProfileBtn").innerHTML =
            `<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/></svg> Save Profile`;
    }
}

// ── LOAD NOTIFICATIONS ────────────────────────────────────────────
async function loadNotifications() {
    try {
        const res  = await fetch(`${API}/user/notifications`, { headers: { "Authorization": "Bearer "+token } });
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById("notifEmail").checked  = data.emailNotifications !== false;
        document.getElementById("notifDigest").checked = data.weeklyDigest !== false;
        document.getElementById("notifTips").checked   = data.careerTips || false;
    } catch(e) { console.warn("Notifications load failed:", e.message); }
}

// ── SAVE NOTIFICATIONS ────────────────────────────────────────────
async function saveNotifications() {
    setBtnLoading("saveNotifBtn", true);
    try {
        const res = await fetch(`${API}/user/notifications`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer "+token },
            body:    JSON.stringify({
                emailNotifications: document.getElementById("notifEmail").checked,
                weeklyDigest:       document.getElementById("notifDigest").checked,
                careerTips:         document.getElementById("notifTips").checked,
            })
        });
        if (!res.ok) throw new Error("Failed to save");
        showSuccess("Notification preferences saved!");
    } catch(e) {
        showError(e.message || "Failed to save notifications");
    } finally {
        setBtnLoading("saveNotifBtn", false, "Save Preferences");
    }
}

// ── PASSWORD STRENGTH ─────────────────────────────────────────────
function checkPwdStrength(val) {
    const segs  = [1,2,3,4].map(i => document.getElementById("ps"+i));
    const label = document.getElementById("pwdLabel");
    if (!val) { segs.forEach(s => s.className="pwd-seg"); label.textContent=""; return; }
    let score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const lvls = [{cls:"weak",text:"Weak"},{cls:"fair",text:"Fair"},{cls:"good",text:"Good"},{cls:"strong",text:"Strong"}];
    segs.forEach((s,i) => { s.className="pwd-seg"; if(i<score) s.classList.add(lvls[score-1].cls); });
    const lv = lvls[score-1] || lvls[0];
    label.textContent = lv.text;
    label.style.color = score===1?"var(--red)":score===2?"var(--amber)":score===3?"var(--green)":"var(--teal)";
}

// ── CHANGE PASSWORD (Supabase SDK directly) ───────────────────────
async function changePassword() {
    const current  = document.getElementById("pwdCurrent").value.trim();
    const newPwd   = document.getElementById("pwdNew").value.trim();
    const confirm  = document.getElementById("pwdConfirm").value.trim();

    if (!current)             { showError("Please enter your current password"); return; }
    if (newPwd.length < 6)    { showError("New password must be at least 6 characters"); return; }
    if (newPwd !== confirm)   { showError("Passwords do not match"); return; }

    setBtnLoading("savePwdBtn", true);

    try {
        // Load Supabase SDK if not already loaded
        if (!window.supabase) {
            await new Promise((res, rej) => {
                const s = document.createElement("script");
                s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
                s.onload = res; s.onerror = rej;
                document.head.appendChild(s);
            });
        }

        const sb = window.supabase.createClient(SUPA_URL, SUPA_ANON);

        // Set session from stored token
        await sb.auth.setSession({ access_token: token, refresh_token: localStorage.getItem("refreshToken") || token });

        // Update password
        const { error } = await sb.auth.updateUser({ password: newPwd });
        if (error) throw new Error(error.message);

        // Clear fields
        document.getElementById("pwdCurrent").value = "";
        document.getElementById("pwdNew").value     = "";
        document.getElementById("pwdConfirm").value = "";
        [1,2,3,4].forEach(i => document.getElementById("ps"+i).className="pwd-seg");
        document.getElementById("pwdLabel").textContent = "";

        showSuccess("Password changed successfully! Please log in again with your new password.");

        // Sign out after 3 seconds
        setTimeout(() => {
            sb.auth.signOut();
            localStorage.clear();
            window.location.href = "/login.html?reset=success";
        }, 3000);

    } catch(e) {
        // Fallback: try backend API
        try {
            const res = await fetch(`${API}/user/change-password`, {
                method:  "PUT",
                headers: { "Content-Type": "application/json", "Authorization": "Bearer "+token },
                body:    JSON.stringify({ currentPassword: current, newPassword: newPwd })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            showSuccess("Password changed successfully!");
            document.getElementById("pwdCurrent").value = "";
            document.getElementById("pwdNew").value     = "";
            document.getElementById("pwdConfirm").value = "";
        } catch(e2) {
            showError(e2.message || "Failed to change password. Please use Forgot Password on the login page.");
        }
    } finally {
        const btn = document.getElementById("savePwdBtn");
        btn.disabled    = false;
        btn.textContent = "🔐 Update Password";
    }
}

// ── SESSION INFO ──────────────────────────────────────────────────
function loadSessionInfo() {
    const ua    = navigator.userAgent;
    const isM   = /Mobile|Android|iPhone/.test(ua);
    const isSaf = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isChr = /Chrome/.test(ua);
    const isFF  = /Firefox/.test(ua);
    const browser = isChr?"Chrome":isSaf?"Safari":isFF?"Firefox":"Browser";
    const device  = isM?"Mobile Device":"Desktop";
    document.getElementById("sessionMeta").textContent =
        `${device} · ${browser} · ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`;
}

// ── MODAL ─────────────────────────────────────────────────────────
let modalAction = null;
function openModal(icon, title, msg, btnText, action) {
    document.getElementById("modalIcon").textContent  = icon;
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMsg").innerHTML     = msg; // Changed to innerHTML to support <br> tags
    document.getElementById("modalConfirmBtn").textContent = btnText;
    document.getElementById("modal").style.display = "flex";
    modalAction = action;
}
function closeModal() {
    document.getElementById("modal").style.display = "none";
    modalAction = null;
}
document.getElementById("modalConfirmBtn").addEventListener("click", () => {
    if (modalAction) { modalAction(); closeModal(); }
});

// ── DANGER ZONE ACTIONS ───────────────────────────────────────────
function showLogoutConfirm() {
    openModal("🚪","Sign Out Everywhere?",
        "This will sign out all other sessions. You'll stay logged in on this device.",
        "Sign Out Others",
        async () => {
            try {
                await fetch(`${API}/user/signout-all`, {
                    method:  "POST",
                    headers: { "Authorization": "Bearer "+token }
                });
                showSuccess("All other sessions have been signed out.");
            } catch { showSuccess("Sessions cleared."); }
        }
    );
}

// ✅ FIXED: Clear History - Now clears ALL history including ATS
function clearHistory() {
    openModal(
        "🗑️",
        "Clear All History?",
        `This will permanently delete:<br><br>
        • All activity history<br>
        • All ATS check results<br>
        • All login history<br>
        • All resume upload records<br><br>
        <strong>This action cannot be undone!</strong>`,
        "Clear History",
        async () => {
            try {
                console.log('🗑️ Clearing history...');
                
                // ✅ CORRECT ENDPOINT: /user/clear-history (was /history/clear)
                const res = await fetch(`${API}/user/clear-history`, {
                    method: "POST",
                    headers: { 
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json"
                    }
                });
                
                const data = await res.json();
                
                if (res.ok && data.success) {
                    showSuccess("All activity history cleared successfully!");
                    console.log('✅ History cleared');
                } else {
                    throw new Error(data.message || "Failed to clear history");
                }
                
            } catch (error) {
                console.error('❌ Clear history error:', error);
                showError(error.message || "Failed to clear history. Please try again.");
            }
        }
    );
}

async function exportData() {
    try {
        const res  = await fetch(`${API}/user/profile`, { headers: { "Authorization": "Bearer "+token } });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a    = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(blob),
            download: `ai-placement-data-${new Date().toISOString().split("T")[0]}.json`
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        showSuccess("Your data has been exported successfully.");
    } catch { showError("Failed to export data."); }
}

function confirmDelete() {
    openModal("💀","Delete Your Account?",
        "This will permanently delete your account, resume, ATS history and all data. This cannot be undone.",
        "Yes, Delete Forever",
        async () => {
            try {
                const res  = await fetch(`${API}/user/delete`, {
                    method:  "DELETE",
                    headers: { "Authorization": "Bearer "+token }
                });
                const data = await res.json();
                if (res.ok) {
                    showSuccess("Account deleted. Redirecting…");
                    localStorage.clear();
                    setTimeout(() => window.location.href = "/login.html", 2000);
                } else {
                    showError(data.message || "Failed to delete account.");
                }
            } catch(e) {
                showError("Error: " + e.message);
            }
        }
    );
}

console.log('✅ Settings.js loaded - Clear History fixed');