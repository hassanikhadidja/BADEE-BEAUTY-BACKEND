const Order = require("../models/order");

// ── Delivery fee config ──────────────────────────────────────────
const FREE_DELIVERY_THRESHOLD = 5000; // DA — orders above this get free delivery
const DELIVERY_FEE = 500;             // DA — flat fee below threshold

// ── CREATE order (public — no auth required) ─────────────────────
exports.CreateOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, phone, wilaya, commune, items, note } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ msg: "Order must have at least one item" });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    // Attach userId if the request comes from a logged-in user
    const userId = req.user ? req.user._id : null;

    const order = new Order({
      customerName,
      customerEmail: typeof customerEmail === "string" ? customerEmail.trim() : "",
      phone,
      wilaya,
      commune: typeof commune === "string" ? commune.trim() : "",
      userId,
      items,
      subtotal,
      deliveryFee,
      total,
      note: note || "",
    });

    await order.save();
    return res.status(201).json({ msg: "Order placed successfully", orderId: order._id });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

// ── GET all orders (admin only) ───────────────────────────────────
exports.GetOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

// ── GET single order ─────────────────────────────────────────────
exports.GetOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json(order);
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

// ── UPDATE order status (admin only) ─────────────────────────────
exports.UpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ msg: "Invalid status value" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );
    if (!order) return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json({ msg: "Status updated", order });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

// ── DELETE order (admin only) ─────────────────────────────────────
exports.DeleteOrder = async (req, res) => {
  try {
    const result = await Order.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ msg: "Order not found" });
    return res.status(200).json({ msg: "Order deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

// ── Export config so frontend can use same values ─────────────────
exports.GetConfig = (req, res) => {
  res.json({ freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD, deliveryFee: DELIVERY_FEE });
};
