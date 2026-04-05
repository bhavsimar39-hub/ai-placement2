// backend/config/db.js
// ─────────────────────────────────────────────────────────────────
// Replaces mongoose.connect() with Supabase client initialisation.
// Exports the supabase client so models can use it.
// server.js calls connectDB() exactly as before — no changes needed.
// ─────────────────────────────────────────────────────────────────

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

// Service-role key — full DB access, only used server-side
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const connectDB = async () => {
    try {
        // Ping the users table to verify connectivity
        const { error } = await supabase
            .from("users")
            .select("id")
            .limit(1);

        // PGRST116 = table empty, which is fine
        if (error && error.code !== "PGRST116") {
            throw new Error(error.message);
        }

        console.log("🔥 Supabase Database Connected Successfully!");
    } catch (err) {
        console.error("❌ Supabase Connection Error:", err.message);
        console.error("   → Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
        console.error("   → Make sure the 'users' table exists (run the SQL setup script)");
        process.exit(1);
    }
};

export { supabase };
export default connectDB;