import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { CreateTripInput, UpdateTripInput } from "../validators/trip.validator";

export class TripService {
  static async createTrip(userId: string, input: CreateTripInput) {
    const trip = await prisma.trip.create({
      data: {
        userId,
        name: input.name,
        description: input.description || null,
        coverImage: input.coverPhoto || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        visibility: input.isPublic ? "PUBLIC" : "PRIVATE",
        totalBudget: 0,
      },
      include: {
        destinations: {
          include: {
            destination: true,
          },
          orderBy: {
            visitOrder: "asc",
          },
        },
        tripAttractions: {
          include: {
            attraction: true
          }
        }
      },
    });

    return trip;
  }

  static async getMyTrips(userId: string) {
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        destinations: {
          include: {
            destination: true
          },
          orderBy: { visitOrder: "asc" },
        },
        tripAttractions: {
          include: { attraction: true }
        }
      },
    });

    return trips;
  }

  static async getTripById(userId: string, tripId: string) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId, // Enforce strict ownership check
      },
      include: {
        destinations: {
          include: {
            destination: true
          },
          orderBy: { visitOrder: "asc" },
        },
        tripAttractions: {
          include: { attraction: true },
          orderBy: { order: "asc" }
        }
      },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    return trip;
  }

  static async updateTrip(userId: string, tripId: string, input: UpdateTripInput) {
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existingTrip) {
      throw new AppError("Trip not found", 404);
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.coverPhoto !== undefined ? { coverImage: input.coverPhoto } : {}),
        ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
        ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
        ...(input.isPublic !== undefined ? { visibility: input.isPublic ? "PUBLIC" : "PRIVATE" } : {}),
      },
      include: {
        destinations: {
          include: {
            destination: true,
          },
          orderBy: { visitOrder: "asc" },
        },
        tripAttractions: {
          include: { attraction: true }
        }
      },
    });

    return updatedTrip;
  }

  static async deleteTrip(userId: string, tripId: string) {
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existingTrip) {
      throw new AppError("Trip not found", 404);
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return { success: true, message: "Trip deleted successfully" };
  }

  static async saveItinerary(userId: string, tripId: string, itineraryData: any) {
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existingTrip) {
      throw new AppError("Trip not found", 404);
    }

    // 1. Delete existing relations
    await prisma.tripDestination.deleteMany({
      where: { tripId },
    });
    await prisma.tripAttraction.deleteMany({
      where: { tripId },
    });

    let totalBudget = 0;

    // 2. Re-create destinations and attractions
    for (const section of itineraryData.sections || []) {
      const dest = await prisma.tripDestination.create({
        data: {
          tripId,
          destinationId: section.cityId,
          visitOrder: section.order || 0,
        },
      });

      // Calculate simple budget if passed from frontend
      totalBudget += Number(section.budget) || 0;

      for (const act of section.activities || []) {
        await prisma.tripAttraction.create({
          data: {
            tripId,
            tripDestinationId: dest.id,
            attractionId: act.id,
            scheduledDate: act.scheduledDate ? new Date(act.scheduledDate) : null,
          }
        });
      }
    }

    // 3. Update total budget on trip
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { totalBudget },
      include: {
        destinations: { include: { destination: true }, orderBy: { visitOrder: "asc" } },
        tripAttractions: { include: { attraction: true } }
      }
    });

    return updatedTrip;
  }
}
