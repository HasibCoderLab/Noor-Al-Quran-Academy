import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["free-trial", "class", "subscription"],
      default: "free-trial",
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    country: { type: String, trim: true },
    course: {
      type: String,
      enum: ["tajweed", "hifz", "nazra", "dua"],
      required: true,
    },
    date: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },
    day: {
      type: String,
      enum: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"],
    },
    time: { type: String, required: true },
    duration: {
      type: Number,
      enum: [30, 45, 60],
      default: 30,
    },
    message: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

bookingSchema.index({ email: 1, createdAt: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ date: 1, time: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
