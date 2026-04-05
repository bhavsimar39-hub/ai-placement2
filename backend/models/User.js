// backend/models/User.js
// ─────────────────────────────────────────────────────────────────
// Mongoose-compatible User model backed by Supabase PostgreSQL.
// ─────────────────────────────────────────────────────────────────

import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../config/db.js";

// ── Column name mappings (DB snake_case ↔ JS camelCase) ──────────
const DB_TO_JS = {
    id:                 "_id",
    readiness_score:    "readinessScore",
    job_matches:        "jobMatches",
    skill_gaps:         "skillGaps",
    resume_path:        "resumePath",
    matched_jobs:       "matchedJobs",
    missing_skills:     "missingSkills",
    preferred_role:     "preferredRole",
    experience_level:   "experienceLevel",
    expected_salary:    "expectedSalary",
    interview_prep:     "interviewPrep",
    user_known_skills:  "userKnownSkills",
    learning_progress:  "learningProgress",
    activity_history:   "activityHistory",
    ats_analysis:       "atsAnalysis",
    last_login:         "lastLogin",
    login_history:      "loginHistory",
    reset_otp:          "resetOtp",
    reset_otp_expiry:   "resetOtpExpiry",
    resume_count:       "resumeCount",        // NEW!
    resume_history:     "resumeHistory",      // NEW!
    created_at:         "createdAt",
    updated_at:         "updatedAt",
};

const JS_TO_DB = Object.fromEntries(
    Object.entries(DB_TO_JS).map(([db, js]) => [js, db])
);

// ── Convert DB row → JS object ────────────────────────────────────
function rowToJS(row) {
    if (!row) return null;
    const obj = {};
    for (const [key, val] of Object.entries(row)) {
        const jsKey = DB_TO_JS[key] || key;
        obj[jsKey] = val;
    }
    if (obj._id) obj._id = String(obj._id);
    return obj;
}

// ── Convert JS object → DB row ────────────────────────────────────
function jsToRow(obj) {
    const row = {};
    for (const [key, val] of Object.entries(obj)) {
        if (key === "_id") { row.id = val; continue; }
        const dbKey = JS_TO_DB[key] || key;
        row[dbKey] = val;
    }
    return row;
}

// ── Default values ─────────────────────────────────────────────────
const DEFAULTS = {
    resume: {
        filename: null, uploadedAt: null,
        extractedText: null, skills: [], experienceLevel: "Entry Level"
    },
    readinessScore:   0,
    jobMatches:       [],
    skillGaps:        [],
    resumePath:       null,
    matchedJobs:      [],
    missingSkills:    [],
    phone:            null,
    location:         null,
    preferredRole:    null,
    experienceLevel:  null,
    expectedSalary:   null,
    bio:              null,
    notifications:    { email: true, weeklyDigest: true, tips: false },
    interviewPrep:    [],
    userKnownSkills:  [],
    learningProgress: [],
    activityHistory:  [],
    atsAnalysis:      [],
    loginHistory:     [],
    resetOtp:         null,
    resetOtpExpiry:   null,
    resumeCount:      0,          // NEW: Track total resume uploads
    resumeHistory:    [],         // NEW: Store all resume uploads
};

// ════════════════════════════════════════════════════════════════
//  UserInstance
// ════════════════════════════════════════════════════════════════
class UserInstance {
    constructor(data) {
        const withDefaults = { ...DEFAULTS, ...data };
        Object.assign(this, withDefaults);
    }

    async save() {
        const row = jsToRow({ ...this });
        delete row.created_at;
        row.updated_at = new Date().toISOString();

        if (this._id) {
            const { data, error } = await supabase
                .from("users")
                .update(row)
                .eq("id", this._id)
                .select()
                .single();

            if (error) throw new Error("User.save() failed: " + error.message);
            Object.assign(this, rowToJS(data));
        } else {
            const { data, error } = await supabase
                .from("users")
                .insert(row)
                .select()
                .single();

            if (error) throw new Error("User.save() insert failed: " + error.message);
            Object.assign(this, rowToJS(data));
        }
        return this;
    }

    toObject() { return { ...this }; }
    toJSON()   { return { ...this }; }
}

// ════════════════════════════════════════════════════════════════
//  Static query methods
// ════════════════════════════════════════════════════════════════
const User = {

    findById(id) {
        if (!id) return new QueryBuilder(null);
        return new QueryBuilder({ type: "id", id: String(id) });
    },

    findOne(query = {}) {
        return new QueryBuilder({ type: "one", query });
    },

    async _findOne(query = {}) {
        let q = supabase.from("users").select("*");

        if (query.$or && Array.isArray(query.$or)) {
            for (const condition of query.$or) {
                let subQ = supabase.from("users").select("*");
                let valid = true;
                for (const [jsKey, val] of Object.entries(condition)) {
                    if (val === undefined || val === null) { valid = false; break; }
                    const dbKey = JS_TO_DB[jsKey] || jsKey;
                    if (!Object.values(JS_TO_DB).includes(jsKey) && !Object.keys(JS_TO_DB).includes(dbKey)) {
                        valid = false; break;
                    }
                    subQ = subQ.eq(dbKey, val);
                }
                if (!valid) continue;
                const { data } = await subQ.limit(1).maybeSingle();
                if (data) return new UserInstance(rowToJS(data));
            }
            return null;
        }

        for (const [jsKey, val] of Object.entries(query)) {
            if (val === undefined || val === null) continue;
            if (jsKey.startsWith("$")) continue;
            const dbKey = JS_TO_DB[jsKey] || jsKey;
            q = q.eq(dbKey, val);
        }

        const { data, error } = await q.limit(1).maybeSingle();
        if (error) throw new Error("User.findOne() failed: " + error.message);
        return data ? new UserInstance(rowToJS(data)) : null;
    },

    find(query = {}, options = {}) {
        return new QueryBuilder({ type: "find", query, options });
    },

    async _find(query = {}, options = {}) {
        const cols = options.select
            ? options.select.split(" ").map(k => JS_TO_DB[k] || k).join(",")
            : "*";

        let q = supabase.from("users").select(cols);

        for (const [jsKey, val] of Object.entries(query)) {
            if (val === undefined) continue;
            const dbKey = JS_TO_DB[jsKey] || jsKey;
            q = q.eq(dbKey, val);
        }

        if (options.sort) {
            for (const [jsKey, dir] of Object.entries(options.sort)) {
                const dbKey = JS_TO_DB[jsKey] || jsKey;
                q = q.order(dbKey, { ascending: dir === 1 });
            }
        }

        const { data, error } = await q;
        if (error) throw new Error("User.find() failed: " + error.message);
        return (data || []).map(row => new UserInstance(rowToJS(row)));
    },

    async create(data) {
        const withDefaults = { ...DEFAULTS, ...data };
        const row = jsToRow(withDefaults);
        row.updated_at = new Date().toISOString();

        const { data: created, error } = await supabase
            .from("users")
            .insert(row)
            .select()
            .single();

        if (error) {
            if (error.code === "23505") throw new Error("Email already registered");
            throw new Error("User.create() failed: " + error.message);
        }
        return new UserInstance(rowToJS(created));
    },

    async findByIdAndUpdate(id, update, options = {}) {
        const row = jsToRow(update.$set || update);
        delete row.id;
        row.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("users")
            .update(row)
            .eq("id", String(id))
            .select()
            .single();

        if (error) throw new Error("User.findByIdAndUpdate() failed: " + error.message);
        return options.new !== false ? new UserInstance(rowToJS(data)) : null;
    },

    select(cols) {
        return this.find({}, { select: cols });
    },

    sort(sortObj) {
        return this.find({}, { sort: sortObj });
    },
};

// ════════════════════════════════════════════════════════════════
//  QueryBuilder
// ════════════════════════════════════════════════════════════════
class QueryBuilder {
    constructor(spec) {
        this._spec     = spec;
        this._select   = null;
        this._sortOpts = null;
        this._limit    = null;
    }

    select(cols) {
        if (typeof cols === "object" && !Array.isArray(cols)) {
            cols = Object.keys(cols).join(" ");
        }
        this._select = cols;
        return this;
    }

    sort(sortObj) {
        this._sortOpts = sortObj;
        return this;
    }

    limit(n) {
        this._limit = n;
        return this;
    }

    lean() { return this; }

    then(resolve, reject) {
        this._execute().then(resolve, reject);
    }

    catch(reject) {
        return this._execute().catch(reject);
    }

    async _execute() {
        if (!this._spec) return null;

        const opts = {};
        if (this._select)   opts.select   = this._select;
        if (this._sortOpts) opts.sort     = this._sortOpts;
        if (this._limit)    opts.limit    = this._limit;

        const { type, id, query } = this._spec;

        if (type === "id") {
            if (!id) return null;
            let q = supabase.from("users").select("*").eq("id", id);
            const { data, error } = await q.maybeSingle();
            if (error) throw new Error("User.findById() failed: " + error.message);
            return data ? new UserInstance(rowToJS(data)) : null;
        }

        if (type === "one") {
            return User._findOne(query || {});
        }

        if (type === "find") {
            return User._find(query || {}, opts);
        }

        return null;
    }
}

export default User;