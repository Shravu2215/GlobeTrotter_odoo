import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post("/register", validate(registerSchema), AuthController.register);

// Alias for frontend compatibility: POST /api/auth/signup
router.post("/signup", validate(registerSchema), AuthController.register);

// POST /api/auth/login
router.post("/login", loginLimiter, validate(loginSchema), AuthController.login);

export default router;
