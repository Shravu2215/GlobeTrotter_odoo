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
        coverPhoto: input.coverPhoto || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isPublic: input.isPublic || false,
      },
      include: {
        sections: {
          include: {
            city: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return trip;
  }

  static async getMyTrips(userId: string) {
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        sections: {
          include: {
            city: true,
            _count: {
              select: { sectionActivities: true },
            },
          },
          orderBy: { order: "asc" },
        },
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
        sections: {
          include: {
            city: true,
            sectionActivities: {
              include: {
                activity: true,
              },
              orderBy: { scheduledDate: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
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
        ...(input.coverPhoto !== undefined ? { coverPhoto: input.coverPhoto } : {}),
        ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
        ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
      },
      include: {
        sections: {
          include: {
            city: true,
          },
          orderBy: { order: "asc" },
        },
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
}
