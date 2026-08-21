const express = require("express");
const authRoutes = require("./auth.routes");
// const domainRoutes = require("./domain.routes"); // add once PS is known

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/domain", domainRoutes);

router.get("/health", (req, res) => res.json({ success: true, message: "API is up" }));

module.exports = router;
