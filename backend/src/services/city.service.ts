import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { CityQueryInput, ActivityQueryInput } from "../validators/city.validator";

export class CityService {
  static async getCities(query: CityQueryInput) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { cityName: { contains: query.search, mode: "insensitive" } },
        { country: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.country) {
      where.country = { contains: query.country, mode: "insensitive" };
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: [{ cityName: "asc" }],
      include: {
        _count: {
          select: { attractions: true },
        },
        accommodation: true,
        foodCost: true,
        seasonalInfo: true,
        outgoingTransport: {
          include: {
            destination: true
          }
        }
      },
    });

    return destinations.map(d => ({
      ...d,
      id: d.id, // Ensure frontend compatibility
      name: d.cityName
    }));
  }

  static async getCityActivities(cityId: string, query: ActivityQueryInput) {
    const destination = await prisma.destination.findUnique({
      where: { id: cityId },
    });

    if (!destination) {
      throw new AppError("City not found", 404);
    }

    const where: any = {
      destinationId: cityId,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.maxCost !== undefined) {
      where.entranceFee = { lte: query.maxCost };
    }

    const attractions = await prisma.attraction.findMany({
      where,
      orderBy: [{ entranceFee: "asc" }, { name: "asc" }],
    });

    return {
      city: destination,
      activities: attractions.map(a => ({
        ...a,
        cost: a.entranceFee,
        image: a.imageUrl || `https://source.unsplash.com/400x300/?${encodeURIComponent(a.category)},${encodeURIComponent(destination.cityName)}`
      })),
    };
  }
}
