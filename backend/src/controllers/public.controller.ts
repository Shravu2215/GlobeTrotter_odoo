import { Request, Response, NextFunction } from "express";
import { PublicService } from "../services/public.service";
import { sendSuccess } from "../utils/response";

export class PublicController {
  static async publishTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await PublicService.publishTrip(req.user!.id, req.params.tripId);
      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.tripId}`).emit("trip:published", trip);
        io.emit("community:updated");
      }
      return sendSuccess(res, { trip }, "Trip published successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async getPublicTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const itinerary = await PublicService.getPublicTripBySlug(req.params.slug);
      return sendSuccess(res, { itinerary }, "Public trip retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async getCommunityTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await PublicService.getCommunityTrips(req.query as any);
      return sendSuccess(res, { trips }, "Community trips retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async copyPublicTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const clonedItinerary = await PublicService.copyPublicTrip(
        req.params.slug,
        req.user!.id
      );
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${req.user!.id}`).emit("trip:created", clonedItinerary);
      }
      return sendSuccess(
        res,
        { trip: clonedItinerary },
        "Trip copied to your account successfully",
        201
      );
    } catch (err) {
      next(err);
    }
  }
}
