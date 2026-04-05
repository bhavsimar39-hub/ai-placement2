import mongoose from "mongoose";

const resumeExtractSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    skills: [String],
    atsScore: Number,
    filePath: String
});

export default mongoose.model("ResumeExtract", resumeExtractSchema);
