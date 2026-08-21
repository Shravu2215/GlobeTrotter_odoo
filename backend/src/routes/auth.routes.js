const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login, me } = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../utils/schemas");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", validate(signupSchema), signup);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);

router.get("/me", authenticate, me);

module.exports = router;