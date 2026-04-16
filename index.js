const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000; // fallback if .env is missing

const connectDB = require("./config/connectDB");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");
const blogRoutes = require("./routes/blogRoutes");


connectDB()

module.exports = app;   // ← Very important for Vercel


const corsOptions = {
    origin: '*', 
    credentials: true, 
  };
app.use(cors(corsOptions));

// ─── 1. Global middleware ──────────────────────────────────────
// Parse JSON bodies (API requests)
app.use(express.json());

// Parse form-urlencoded bodies (HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files (images, etc.) from /uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── 2. Routes ──────────────────────────────────────────────────
app.use("/product", productRoutes);
app.use("/user", userRoutes);

app.use("/order", orderRoutes);
app.use("/blog", blogRoutes);

// ─── 3. 404 handler (catch-all) ────────────────────────────────
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
  // or .send("NOT FOUND") if you prefer plain text
});

// ─── 4. Start server + DB connection ───────────────────────────
const startServer = async () => {
  try {
    await connectDB(); // wait for DB connection
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1); // stop the app if DB fails
  }
};

startServer();