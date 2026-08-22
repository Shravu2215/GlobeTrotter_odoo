import { Router } from "express";
import { SectionController } from "../controllers/section.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  updateSectionSchema,
  assignActivitySchema,
} from "../validators/section.validator";

const router = Router();

// PATCH /api/sections/:id (edit dates/budget)
router.patch(
  "/:id",
  authenticate,
  validate(updateSectionSchema),
  SectionController.updateSection
);

// DELETE /api/sections/:id
router.delete("/:id", authenticate, SectionController.deleteSection);

// POST /api/sections/:sectionId/activities (assign activity)
router.post(
  "/:sectionId/activities",
  authenticate,
  validate(assignActivitySchema),
  SectionController.assignActivity
);

// DELETE /api/sections/:sectionId/activities/:sectionActivityId
router.delete(
  "/:sectionId/activities/:sectionActivityId",
  authenticate,
  SectionController.removeActivity
);

export default router;
