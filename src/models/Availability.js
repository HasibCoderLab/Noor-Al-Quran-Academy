import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },
    day: {
      type: String,
      required: true,
      enum: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"],
    },
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"],
    },
    duration: { type: Number, enum: [30, 45, 60], default: 30 },
    status: {
      type: String,
      enum: ["available", "booked", "blocked"],
      default: "available",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

availabilitySchema.index(
  { date: 1, time: 1, duration: 1 },
  { unique: true }
);
availabilitySchema.index({ status: 1, date: 1, time: 1 });

export default mongoose.models.Availability ||
  mongoose.model("Availability", availabilitySchema);
