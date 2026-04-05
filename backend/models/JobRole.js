import mongoose from "mongoose";

const jobRoleSchema = new mongoose.Schema({
    title: String,
    requiredSkills: [String]
});

export default mongoose.model("JobRole", jobRoleSchema);
