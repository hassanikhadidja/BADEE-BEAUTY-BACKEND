const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  img:       { type: String, default: "" },
  selectedOption: { type: String, default: "" },
  selectedHex:    { type: String, default: "" },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: [true, "Name is required"] },
  customerEmail: { type: String, trim: true, default: "" },
  phone:        { type: String, required: [true, "Phone is required"] },
  wilaya:       { type: String, required: [true, "Wilaya is required"] },
  commune:      { type: String, trim: true, default: "" },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  items:        { type: [orderItemSchema], required: true },
  subtotal:     { type: Number, required: true },
  deliveryFee:  { type: Number, required: true },
  total:        { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending",
  },
  note: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);

