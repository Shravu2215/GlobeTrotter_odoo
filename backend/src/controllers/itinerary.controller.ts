import { Request, Response, NextFunction } from "express";
import { ItineraryService } from "../services/itinerary.service";
import { sendSuccess } from "../utils/response";

export class ItineraryController {
  static async getItinerary(req: Request, res: Response, next: NextFunction) {
    try {
      const itinerary = await ItineraryService.getTripItinerary(
        req.params.tripId,
        req.user?.id
      );
      return sendSuccess(res, { itinerary }, "Itinerary retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
