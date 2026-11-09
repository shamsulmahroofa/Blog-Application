
const express = require("express");
const cors = require("cors");
require("dotenv").config();

if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.error("JWT_SECRET is missing or empty. Set a non-empty JWT_SECRET in backend/.env or the environment before starting the server.");
    process.exit(1);
}

const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
];
const frontendOrigin = process.env.FRONTEND_URL?.trim();

if (frontendOrigin) {
    allowedOrigins.push(frontendOrigin);
}

// Middleware
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"]
}));
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
