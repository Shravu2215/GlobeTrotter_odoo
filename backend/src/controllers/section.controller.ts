import { Request, Response, NextFunction } from "express";
import { SectionService } from "../services/section.service";
import { sendSuccess } from "../utils/response";

export class SectionController {
  static async addSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await SectionService.addSection(
        req.user!.id,
        req.params.tripId,
        req.body
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.tripId}`).emit("section:created", section);
      }

      return sendSuccess(res, { section }, "Section created successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await SectionService.updateSection(
        req.user!.id,
        req.params.id,
        req.body
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${section.tripId}`).emit("section:updated", section);
      }

      return sendSuccess(res, { section }, "Section updated successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SectionService.deleteSection(req.user!.id, req.params.id);

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${result.tripId}`).emit("section:deleted", {
          sectionId: req.params.id,
          tripId: result.tripId,
        });
      }

      return sendSuccess(res, result, "Section deleted successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async reorderSections(req: Request, res: Response, next: NextFunction) {
    try {
      const sections = await SectionService.reorderSections(
        req.user!.id,
        req.params.tripId,
        req.body.sectionIds
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.tripId}`).emit("sections:reordered", {
          tripId: req.params.tripId,
          sections,
        });
      }

      return sendSuccess(res, { sections }, "Sections reordered successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async assignActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SectionService.assignActivity(
        req.user!.id,
        req.params.sectionId,
        req.body
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${result.tripId}`).emit("activity:assigned", {
          tripId: result.tripId,
          sectionId: result.sectionId,
          sectionActivity: result.sectionActivity,
        });
      }

      return sendSuccess(
        res,
        { sectionActivity: result.sectionActivity },
        "Activity assigned successfully",
        201
      );
    } catch (err) {
      next(err);
    }
  }

  static async removeActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SectionService.removeActivity(
        req.user!.id,
        req.params.sectionId,
        req.params.sectionActivityId
      );

      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${result.tripId}`).emit("activity:removed", {
          tripId: result.tripId,
          sectionId: result.sectionId,
          sectionActivityId: req.params.sectionActivityId,
        });
      }

      return sendSuccess(res, result, "Activity removed successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
