const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    categoryLabel: { type: String, default: "Blog", trim: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("blog", blogSchema);
