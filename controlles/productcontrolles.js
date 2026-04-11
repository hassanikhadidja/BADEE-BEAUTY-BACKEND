
// controlles/productcontrolles.js
const Product    = require("../models/product");
const cloudinary = require("../config/cloudinary");

function parseFormBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function parseShades(body) {
  const cat = body.category;
  if (cat !== "Makeup" && cat !== "Hair Color") return [];
  let raw = body.shades;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      const name = String(x?.name || "").trim();
      if (!name) return null;
      const hex = String(x?.hex || "#CCCCCC").trim();
      const row = { name, hex: hex.startsWith("#") ? hex : `#${hex}` };
      if (x?.stock !== "" && x?.stock != null && !Number.isNaN(Number(x.stock))) row.stock = Number(x.stock);
      if (x?.price !== "" && x?.price != null && !Number.isNaN(Number(x.price)) && Number(x.price) > 0) row.price = Number(x.price);
      return row;
    })
    .filter(Boolean);
}

// Upload one buffer to Cloudinary, return secure_url
const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "badee-beauty-products" },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url); }
    ).end(buffer);
  });

// Upload all files in req.files in parallel
const uploadAll = (files) =>
  files && files.length > 0
    ? Promise.all(files.map(f => uploadOne(f.buffer)))
    : Promise.resolve([]);

// ── ADD ──────────────────────────────────────────────────────────
exports.AddProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).send({ msg: "At least one image is required" });

    const urls = await uploadAll(req.files);
    const body = { ...req.body };
    body.isNew = parseFormBool(body.isNew);
    body.isTrending = parseFormBool(body.isTrending);
    // FormData sends `shades` as a JSON string; Mongoose cannot cast "[]" to embedded docs.
    if (body.category !== "Makeup" && body.category !== "Hair Color") {
      body.shades = [];
    } else {
      body.shades = parseShades(body);
    }

    const product = new Product(body);
    product.img = urls;
    await product.save();
    return res.status(201).send({ msg: "product added" });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

// ── GET ALL ──────────────────────────────────────────────────────
exports.GetProducts = async (req, res) => {
  try {
    return res.status(200).json(await Product.find());
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

// ── GET ONE ──────────────────────────────────────────────────────
exports.GetOneProduct = async (req, res) => {
  try {
    return res.status(200).json(await Product.findById(req.params.id));
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

// ── UPDATE ───────────────────────────────────────────────────────
exports.UpdateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.isNew !== undefined) updateData.isNew = parseFormBool(updateData.isNew);
    if (updateData.isTrending !== undefined) updateData.isTrending = parseFormBool(updateData.isTrending);

    // keepImgs: existing Cloudinary URLs the frontend wants to KEEP.
    // Can be a single string or an array — normalise to array.
    let keepImgs = req.body.keepImgs || [];
    if (typeof keepImgs === "string") keepImgs = [keepImgs];

    // Upload any new files
    const newUrls = await uploadAll(req.files);

    // Final img array = kept existing URLs + newly uploaded URLs
    updateData.img = [...keepImgs, ...newUrls];

    // Remove keepImgs from the top-level update object
    // (it's now merged into img, no need to store it separately)
    delete updateData.keepImgs;

    if (
      updateData.category !== undefined &&
      updateData.category !== "Makeup" &&
      updateData.category !== "Hair Color"
    ) {
      updateData.shades = [];
    } else if (updateData.shades !== undefined) {
      let cat = updateData.category;
      if (!cat) {
        const cur = await Product.findById(req.params.id).select("category").lean();
        cat = cur?.category;
      }
      updateData.shades = parseShades({ ...updateData, category: cat });
    }

    await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" }
    );

    return res.status(202).send({ msg: "Update success" });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};

// ── DELETE ───────────────────────────────────────────────────────
exports.DeleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0)
      return res.status(400).send({ msg: "Bad request" });
    return res.status(202).send({ msg: "product deleted" });
  } catch (error) {
    return res.status(503).send({ msg: error.message });
  }
};