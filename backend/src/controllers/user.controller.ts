import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response";

export class UserController {
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateProfile(req.user!.id, req.body);
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${req.user!.id}`).emit("user:updated", user);
      }
      return sendSuccess(res, { user }, "Profile updated successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
