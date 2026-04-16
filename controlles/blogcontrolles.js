const Blog = require("../models/blog");
const cloudinary = require("../config/cloudinary");

function slugify(text) {
  return (
    String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "article"
  );
}

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "badee-beauty-blog" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      },
    ).end(buffer);
  });

exports.GetPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    return res.json(blogs);
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

exports.GetPublishedBlogBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();
    const b = await Blog.findOne({ slug, isPublished: true }).lean();
    if (!b) return res.status(404).json({ msg: "Not found" });
    return res.json(b);
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

exports.GetAllBlogs = async (req, res) => {
  try {
    return res.json(await Blog.find().sort({ updatedAt: -1 }).lean());
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

exports.AddBlog = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) return res.status(400).json({ msg: "Le titre est obligatoire" });

    let slug = String(req.body.slug || "").trim().toLowerCase();
    if (!slug) slug = slugify(title);
    let finalSlug = slug;
    let n = 0;
    while (await Blog.findOne({ slug: finalSlug })) {
      n += 1;
      finalSlug = `${slug}-${n}`;
    }

    let coverImage = "";
    if (req.file && req.file.buffer) {
      coverImage = await uploadOne(req.file.buffer);
    }

    const isPublished = req.body.isPublished === true || req.body.isPublished === "true";

    const blog = new Blog({
      title,
      slug: finalSlug,
      excerpt: String(req.body.excerpt || ""),
      content: String(req.body.content || ""),
      categoryLabel: String(req.body.categoryLabel || "Blog").trim() || "Blog",
      isPublished,
      coverImage,
    });
    await blog.save();
    return res.status(201).json({ msg: "ok", blog });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

exports.UpdateBlog = async (req, res) => {
  try {
    const body = { ...req.body };
    const update = {};

    if (body.title != null) {
      const t = String(body.title).trim();
      if (t) update.title = t;
    }
    if (body.slug != null && String(body.slug).trim()) {
      const slug = String(body.slug).trim().toLowerCase();
      const clash = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (clash) return res.status(400).json({ msg: "Slug déjà utilisé" });
      update.slug = slug;
    }
    if (body.excerpt != null) update.excerpt = String(body.excerpt);
    if (body.content != null) update.content = String(body.content);
    if (body.categoryLabel != null) {
      update.categoryLabel = String(body.categoryLabel).trim() || "Blog";
    }
    if (body.isPublished !== undefined) {
      update.isPublished = body.isPublished === true || body.isPublished === "true";
    }

    if (req.file && req.file.buffer) {
      update.coverImage = await uploadOne(req.file.buffer);
    } else if (Object.prototype.hasOwnProperty.call(body, "keepCover")) {
      update.coverImage = String(body.keepCover || "").trim();
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!blog) return res.status(404).json({ msg: "Not found" });
    return res.json({ msg: "ok", blog });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

exports.DeleteBlog = async (req, res) => {
  try {
    const result = await Blog.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(400).json({ msg: "Bad request" });
    return res.json({ msg: "ok" });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};
