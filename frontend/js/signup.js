// frontend/js/signup.js - Fixed to save token

const API_BASE = "http://localhost:5000/api";

async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!name || !email || !password) {
        alert("Please fill in all fields");
        return;
    }
    
    if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }
    
    const signupBtn = document.querySelector("button[type='submit']");
    const originalText = signupBtn.textContent;
    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";
    
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || "Signup failed");
            return;
        }
        
        console.log("✅ Signup successful:", data);
        
        // CRITICAL: Save the token to localStorage
        if (data.token) {
            localStorage.setItem("token", data.token);
            console.log("✅ Token saved:", data.token.substring(0, 20) + "...");
        } else {
            console.error("❌ No token in response!");
        }
        
        // Save user info (optional)
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        alert("Account created successfully!");
        
        // Redirect to dashboard
        window.location.href = "/dashboard.html";
        
    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed: " + error.message);
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = originalText;
    }
}

// Attach to form
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector("form");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
});