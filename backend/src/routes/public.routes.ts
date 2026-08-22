import { Router } from "express";
import { PublicController } from "../controllers/public.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { communityQuerySchema } from "../validators/public.validator";

const router = Router();

// GET /api/public/trips?search=&sort= (community feed — list of all public trips, no auth)
router.get(
  "/trips",
  validate(communityQuerySchema, "query"),
  PublicController.getCommunityTrips
);

// GET /api/public/trips/:slug (no auth, read-only, 404 if not public)
router.get("/trips/:slug", PublicController.getPublicTrip);

// POST /api/public/trips/:slug/copy (auth required — clones the trip + sections + activities)
router.post("/trips/:slug/copy", authenticate, PublicController.copyPublicTrip);

export default router;
