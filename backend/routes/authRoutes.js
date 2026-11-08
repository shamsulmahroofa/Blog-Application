
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again after 15 minutes."
        });
    }
});

// Registration API
router.post("/register", registerUser);

// Login API
router.post("/login", loginLimiter, loginUser);

module.exports = router;
