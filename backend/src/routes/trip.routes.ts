import { Router } from "express";
import { TripController } from "../controllers/trip.controller";
import { SectionController } from "../controllers/section.controller";
import { ItineraryController } from "../controllers/itinerary.controller";
import { PublicController } from "../controllers/public.controller";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createTripSchema, updateTripSchema } from "../validators/trip.validator";
import {
  createSectionSchema,
  reorderSectionsSchema,
} from "../validators/section.validator";

const router = Router();

// --- Trip CRUD Routes ---
router.post("/", authenticate, validate(createTripSchema), TripController.createTrip);
router.get("/", authenticate, TripController.getMyTrips);
router.get("/:id", authenticate, TripController.getTripById);
router.patch("/:id", authenticate, validate(updateTripSchema), TripController.updateTrip);
router.delete("/:id", authenticate, TripController.deleteTrip);

// --- Trip Itinerary & Budget ---
router.get("/:tripId/itinerary", optionalAuthenticate, ItineraryController.getItinerary);
router.put("/:id/itinerary", authenticate, TripController.saveItinerary);

// --- Trip Publish ---
router.patch("/:tripId/publish", authenticate, PublicController.publishTrip);

// --- Section Nested Routes under Trip ---
router.post(
  "/:tripId/sections",
  authenticate,
  validate(createSectionSchema),
  SectionController.addSection
);

router.patch(
  "/:tripId/sections/reorder",
  authenticate,
  validate(reorderSectionsSchema),
  SectionController.reorderSections
);

export default router;
