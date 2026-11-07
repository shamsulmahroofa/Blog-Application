
const Blog = require("../models/Blog");

// Create Blog
const createBlog = async (req, res) => {
    try {
        const { title, category, image, content, status } = req.body;

        // Validate required fields
        if (!title || !category || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, category and content"
            });
        }

        // Create blog
        const newBlog = await Blog.create({
            title,
            category,
            image: image || "",
            content,
            status: status || "Published",
            author: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully!",
            blog: newBlog
        });

    } catch (error) {
        console.error("Create blog error:", error);

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

    } catch (error) {
        console.error("Get blogs error:", error);

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
        const { title, category, image, content, status } = req.body;

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

        blog.title = title || blog.title;
        blog.category = category || blog.category;
        blog.image = image !== undefined ? image : blog.image;
        blog.content = content || blog.content;
        blog.status = status || blog.status;

        const updatedBlog = await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog updated successfully!",
            blog: updatedBlog
        });

    } catch (error) {
        console.error("Update blog error:", error);

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

    } catch (error) {
        console.error("Delete blog error:", error);

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

    } catch (error) {
        console.error("Get published blogs error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching published blogs."
        });
    }
};

module.exports = {
    createBlog,
    getMyBlogs,
    updateBlog,
    deleteBlog,
    getPublishedBlogs
};