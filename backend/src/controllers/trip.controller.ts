import { Request, Response, NextFunction } from "express";
import { TripService } from "../services/trip.service";
import { sendSuccess } from "../utils/response";

export class TripController {
  static async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.createTrip(req.user!.id, req.body);
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${req.user!.id}`).emit("trip:created", trip);
      }
      return sendSuccess(res, { trip }, "Trip created successfully", 201);
    } catch (err) {
      next(err);
    }
  }

  static async getMyTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await TripService.getMyTrips(req.user!.id);
      return sendSuccess(res, { trips }, "Trips retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async getTripById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.getTripById(req.user!.id, req.params.id);
      return sendSuccess(res, { trip }, "Trip retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.updateTrip(req.user!.id, req.params.id, req.body);
      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.id}`).emit("trip:updated", trip);
        io.to(`user:${req.user!.id}`).emit("trip:updated", trip);
      }
      return sendSuccess(res, { trip }, "Trip updated successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TripService.deleteTrip(req.user!.id, req.params.id);
      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.id}`).emit("trip:deleted", { tripId: req.params.id });
        io.to(`user:${req.user!.id}`).emit("trip:deleted", { tripId: req.params.id });
      }
      return sendSuccess(res, result, "Trip deleted successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async saveItinerary(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.saveItinerary(req.user!.id, req.params.id, req.body);
      const io = req.app.get("io");
      if (io) {
        io.to(`trip:${req.params.id}`).emit("trip:updated", trip);
        io.to(`user:${req.user!.id}`).emit("trip:updated", trip);
      }
      return sendSuccess(res, { trip }, "Itinerary saved successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
