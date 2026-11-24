
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const { initializeDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Frontend files are directly inside the parent supermarket folder
const frontendPath = path.join(__dirname, "..");

// Check required environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing. Add it to backend/.env");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to backend/.env");
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Frontend static files
app.use(express.static(frontendPath));

// Authentication routes
app.use("/api/auth", require("./routes/auth"));

// Protected test route
const requireAuth = require("./middleware/requireAuth");

app.get("/api/protected", requireAuth, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated!",
    user: req.session.user
  });
});

// Protected supermarket homepage
app.get("/store", requireAuth, (req, res) => {
  res.sendFile(path.join(frontendPath, "home.html"));
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server after database initialization
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log("Neon PostgreSQL connected; users table is ready.");
      console.log(`FreshMart backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start FreshMart backend:", error);
    process.exit(1);
  }
}

startServer();
