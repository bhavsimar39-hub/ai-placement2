// frontend/js/login.js - Fixed to save token

const API_BASE = "http://localhost:5000/api";

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }
    
    const loginBtn = document.querySelector("button[type='submit']");
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }
        
        console.log("✅ Login successful:", data);
        
        // CRITICAL: Save the token to localStorage
        if (data.token) {
            localStorage.setItem("token", data.token);
            console.log("✅ Token saved:", data.token.substring(0, 20) + "...");
            console.log("✅ Token length:", data.token.length);
        } else {
            console.error("❌ No token in response!");
            alert("Login succeeded but no token received. Please contact support.");
            return;
        }
        
        // Save user info (optional)
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        alert("Login successful!");
        
        // Redirect to dashboard
        window.location.href = "/dashboard.html";
        
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
}

// Attach to form
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});