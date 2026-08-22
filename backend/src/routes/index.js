const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.get("/health", (req, res) => res.json({ success: true, message: "API is operational" }));

module.exports = router;
