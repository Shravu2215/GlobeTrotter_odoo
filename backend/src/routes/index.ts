import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import tripRoutes from "./trip.routes";
import sectionRoutes from "./section.routes";
import cityRoutes from "./city.routes";
import publicRoutes from "./public.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "GlobeTrotter API is operational",
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trips", tripRoutes);
router.use("/sections", sectionRoutes);
router.use("/cities", cityRoutes);
router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);

export default router;
