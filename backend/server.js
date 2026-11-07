
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to BlogSpace Backend API!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BlogSpace API is working successfully!"
    });
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`BlogSpace server running at http://localhost:${PORT}`);
    });
};

startServer();
