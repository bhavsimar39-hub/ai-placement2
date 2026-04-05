import mongoose from "mongoose";

const readinessSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prsScore: Number,
    skillMatch: Number,
    resumeQuality: Number,
    cgpaNormalized: Number,
    projectsScore: Number
});

export default mongoose.model("Readiness", readinessSchema);
