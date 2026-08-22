import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { sendSuccess } from "../utils/response";

export class AdminController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getStats();
      return sendSuccess(res, { stats }, "Admin stats retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
