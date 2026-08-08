import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"],
    },
    time: { type: String, required: true },
    duration: { type: Number, enum: [30, 45, 60], default: 30 },
    status: {
      type: String,
      enum: ["available", "booked"],
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

availabilitySchema.index({ day: 1, time: 1, duration: 1, status: 1 });

export default mongoose.models.Availability ||
  mongoose.model("Availability", availabilitySchema);
