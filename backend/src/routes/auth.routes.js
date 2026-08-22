const express = require("express");
const { signup, login, me } = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../utils/schemas");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), signup);

// POST /api/auth/register
router.post("/register", validate(signupSchema), signup);

// POST /api/auth/login
router.post("/login", validate(loginSchema), login);

// GET /api/auth/me
router.get("/me", authenticate, me);

module.exports = router;