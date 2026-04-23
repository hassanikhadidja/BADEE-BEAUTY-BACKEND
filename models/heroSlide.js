const mongoose = require("mongoose");

const LAYOUTS = ["mobile", "tablet", "desktop"];

const heroSlideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    layout: {
      type: String,
      enum: LAYOUTS,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      default: null,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

heroSlideSchema.index({ layout: 1, order: 1 });

module.exports = mongoose.model("heroslide", heroSlideSchema);
