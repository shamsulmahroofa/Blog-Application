
const Blog = require("../models/blog");

const VALID_STATUSES = ["Published", "Draft"];
const isValidBlogId = id => /^[0-9a-fA-F]{24}$/.test(id);

// Create Blog
const createBlog = async (req, res) => {
    try {
        const { title, category, image, content, status } = req.body || {};

        if (
            typeof title !== "string" ||
            typeof category !== "string" ||
            typeof content !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content must be provided as strings"
            });
        }

        const normalizedTitle = title.trim();
        const normalizedCategory = category.trim();
        const normalizedContent = content.trim();

        if (!normalizedTitle || !normalizedCategory || !normalizedContent) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content cannot be empty"
            });
        }

        if (image !== undefined && typeof image !== "string") {
            return res.status(400).json({
                success: false,
                message: "Image must be a string"
            });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Published or Draft"
            });
        }

        // Create blog
        const newBlog = await Blog.create({
            title: normalizedTitle,
            category: normalizedCategory,
            image: image === undefined ? "" : image,
            content: normalizedContent,
            status: status === undefined ? "Published" : status,
            author: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully!",
            blog: newBlog
        });

    } catch {
        console.error("Create blog failed.");

        res.status(500).json({
            success: false,
            message: "Server error while creating blog"
        });
    }
};

// ==========================================
// GET LOGGED-IN USER'S BLOGS
// ==========================================

const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs: blogs
        });

    } catch {
        console.error("Get blogs failed.");

        res.status(500).json({
            success: false,
            message: "Server error while retrieving blogs"
        });
    }
};

// ==========================================
// UPDATE BLOG
// ==========================================

const updateBlog = async (req, res) => {
    try {
        const { title, category, image, content, status } = req.body || {};

        if (!isValidBlogId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        if (
            (title !== undefined && (typeof title !== "string" || !title.trim())) ||
            (category !== undefined && (typeof category !== "string" || !category.trim())) ||
            (content !== undefined && (typeof content !== "string" || !content.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content must be non-empty strings when provided"
            });
        }

        if (image !== undefined && typeof image !== "string") {
            return res.status(400).json({
                success: false,
                message: "Image must be a string"
            });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Published or Draft"
            });
        }

        const blog = await Blog.findOne({
            _id: req.params.id,
            author: req.user.userId
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        if (title !== undefined) blog.title = title.trim();
        if (category !== undefined) blog.category = category.trim();
        if (image !== undefined) blog.image = image;
        if (content !== undefined) blog.content = content.trim();
        if (status !== undefined) blog.status = status;

        const updatedBlog = await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog updated successfully!",
            blog: updatedBlog
        });

    } catch {
        console.error("Update blog failed.");

        res.status(500).json({
            success: false,
            message: "Server error while updating blog."
        });
    }
};

// ==========================================
// DELETE BLOG
// ==========================================

const deleteBlog = async (req, res) => {
    try {
        if (!isValidBlogId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        const blog = await Blog.findOne({
            _id: req.params.id,
            author: req.user.userId
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        await blog.deleteOne();

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully!"
        });

    } catch {
        console.error("Delete blog failed.");

        res.status(500).json({
            success: false,
            message: "Server error while deleting blog."
        });
    }
};

// Get all published blogs for the Home Page
const getPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: "Published" })
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });

    } catch {
        console.error("Get published blogs failed.");

        res.status(500).json({
            success: false,
            message: "Server error while fetching published blogs."
        });
    }
};


// Get one published blog by ID
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!isValidBlogId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        const blog = await Blog.findOne({
            _id: id,
            status: "Published"
        }).populate("author", "name");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        res.status(200).json({
            success: true,
            blog
        });

    } catch {
        console.error("Get blog details failed.");

        res.status(500).json({
            success: false,
            message: "Server error while fetching blog details."
        });
    }
};

module.exports = {
    createBlog,
    getMyBlogs,
    updateBlog,
    deleteBlog,
    getPublishedBlogs,
    getBlogById
};