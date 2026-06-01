const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "User account is inactive",
      });
    }

    const token = jwt.sign(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: String(user._id),
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
