import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    region: { type: String, enum: ["bd", "intl"], required: true },
    planName: { type: String, required: true },
    classes: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "expired"],
      default: "pending",
      index: true,
    },
    stripeSessionId: { type: String, default: null },
    stripeEventId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index(
  { stripeSessionId: 1 },
  { unique: true, partialFilterExpression: { stripeSessionId: { $type: "string" } } }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
