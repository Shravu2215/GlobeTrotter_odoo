import { Router } from "express";
import { CityController } from "../controllers/city.controller";
import { validate } from "../middleware/validate.middleware";
import {
  cityQuerySchema,
  activityQuerySchema,
} from "../validators/city.validator";

const router = Router();

// GET /api/cities?search=&country= (public)
router.get("/", validate(cityQuerySchema, "query"), CityController.getCities);

// GET /api/cities/:cityId/activities?type=&category=&maxCost= (public)
router.get(
  "/:cityId/activities",
  validate(activityQuerySchema, "query"),
  CityController.getCityActivities
);

export default router;
