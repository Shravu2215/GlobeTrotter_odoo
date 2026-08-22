const express = require("express");
const { getMe, updateMe, deleteMe } = require("../controllers/user.controller.js");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me
router.get("/me", authenticate, getMe);

// PATCH /api/users/me
router.patch("/me", authenticate, updateMe);

// DELETE /api/users/me
router.delete("/me", authenticate, deleteMe);

module.exports = router;
