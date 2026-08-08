import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: String,
      enum: ["tajweed", "hifz", "nazra", "dua"],
      required: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
    currentLesson: { type: String, trim: true, default: "" },
    lessonsCompleted: { type: Number, default: 0, min: 0 },
    totalLessons: { type: Number, default: 0, min: 0 },
    lastAssessment: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model("Progress", progressSchema);
