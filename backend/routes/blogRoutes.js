
const express = require("express");
const router = express.Router();

const {
    createBlog,
    getMyBlogs,
    updateBlog,
    deleteBlog,
    getPublishedBlogs,
    getBlogById
} = require("../controllers/blogController");

const protect = require("../middleware/authMiddleware");

// Public route - Home Page
router.get("/published", getPublishedBlogs);
router.get("/published/:id", getBlogById);

// Protected routes
router.post("/", protect, createBlog);
router.get("/", protect, getMyBlogs);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
