// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// Connect MongoDB
connectDB();

// Middleware
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: frontendURL }));
app.use(express.json({ limit: '10mb' })); // Limit request body size to 10MB

// Routes
app.get("/", (req, res) => res.send("📊 Personal Finance API Running"));
app.use("/api/users", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/upload", require("./routes/upload"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server started on port ${PORT}`)
);
