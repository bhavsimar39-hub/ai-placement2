import mongoose from "mongoose";

const skillProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currentSkills: [String],
    missingSkills: [String]
});

export default mongoose.model("SkillProfile", skillProfileSchema);
