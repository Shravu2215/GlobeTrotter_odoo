import { Router } from "express";
import { Role } from "@prisma/client";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// GET /api/admin/stats (trip count, top cities, top activities, user count — auth + admin check)
router.get("/stats", authenticate, authorize(Role.ADMIN), AdminController.getStats);

export default router;
