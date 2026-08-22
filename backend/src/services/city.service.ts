import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { CityQueryInput, ActivityQueryInput } from "../validators/city.validator";

export class CityService {
  static async getCities(query: CityQueryInput) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { country: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.country) {
      where.country = { contains: query.country, mode: "insensitive" };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: [{ popularity: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });

    return cities;
  }

  static async getCityActivities(cityId: string, query: ActivityQueryInput) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new AppError("City not found", 404);
    }

    const where: any = {
      cityId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.maxCost !== undefined) {
      where.cost = { lte: query.maxCost };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: [{ cost: "asc" }, { name: "asc" }],
    });

    return {
      city,
      activities,
    };
  }
}
