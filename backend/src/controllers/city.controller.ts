import { Request, Response, NextFunction } from "express";
import { CityService } from "../services/city.service";
import { sendSuccess } from "../utils/response";

export class CityController {
  static async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const cities = await CityService.getCities(req.query as any);
      return sendSuccess(res, { cities }, "Cities retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }

  static async getCityActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CityService.getCityActivities(
        req.params.cityId,
        req.query as any
      );
      return sendSuccess(res, result, "City activities retrieved successfully", 200);
    } catch (err) {
      next(err);
    }
  }
}
