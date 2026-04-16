const express = require("express");
const router = express.Router();
const controlles = require("../controlles/blogcontrolles");
const upload = require("../utils/multer");
const { Auth } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

router.get("/public", controlles.GetPublishedBlogs);
router.get("/public/:slug", controlles.GetPublishedBlogBySlug);

router.get("/admin", Auth, isAdmin, controlles.GetAllBlogs);
router.post("/admin", upload.single("cover"), Auth, isAdmin, controlles.AddBlog);
router.patch("/admin/:id", upload.single("cover"), Auth, isAdmin, controlles.UpdateBlog);
router.delete("/admin/:id", Auth, isAdmin, controlles.DeleteBlog);

module.exports = router;
