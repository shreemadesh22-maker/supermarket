const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2 || name.length > 100 || !email || password.length < 6) {
      return res.status(400).json({
        message: "Enter a name (2–100 characters), valid email, and password with at least 6 characters."
      });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLooksValid || email.length > 255) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({
      message: "Account created successfully.",
      user: req.session.user
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists. Please login."
      });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return res.json({
      message: "Login successful.",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false, message: "Please login." });
  }
  return res.json({ authenticated: true, user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Could not logout. Please try again." });
    }
    res.clearCookie("freshmart.sid");
    return res.json({ message: "Logged out successfully." });
  });
});

module.exports = router;
