import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/user.validator";

const router = Router();

// GET /api/users/me
router.get("/me", authenticate, AuthController.getMe);

// PATCH /api/users/me
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  UserController.updateProfile
);

export default router;
