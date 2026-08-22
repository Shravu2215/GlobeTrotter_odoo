import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { generateSlug } from "../utils/slug";
import { CommunityQueryInput } from "../validators/public.validator";
import { ItineraryService } from "./itinerary.service";

export class PublicService {
  static async publishTrip(userId: string, tripId: string) {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    let shareSlug = trip.shareSlug;
    if (!shareSlug) {
      shareSlug = generateSlug(trip.name);
      // Ensure unique slug
      const existingSlug = await prisma.trip.findUnique({
        where: { shareSlug },
      });
      if (existingSlug) {
        shareSlug = generateSlug(`${trip.name}-${Date.now().toString().slice(-4)}`);
      }
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        isPublic: true,
        shareSlug,
      },
    });

    return updated;
  }

  static async getPublicTripBySlug(slug: string) {
    const trip = await prisma.trip.findFirst({
      where: {
        shareSlug: slug,
        isPublic: true,
      },
    });

    if (!trip) {
      throw new AppError("Public trip not found", 404);
    }

    return ItineraryService.getTripItinerary(trip.id);
  }

  static async getCommunityTrips(query: CommunityQueryInput) {
    const where: any = {
      isPublic: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        {
          sections: {
            some: {
              city: {
                name: { contains: query.search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photo: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
          include: {
            city: true,
            _count: {
              select: { sectionActivities: true },
            },
          },
        },
      },
    });

    return trips;
  }

  static async copyPublicTrip(slug: string, newUserId: string) {
    const sourceTrip = await prisma.trip.findFirst({
      where: {
        shareSlug: slug,
        isPublic: true,
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            sectionActivities: {
              include: {
                activity: true,
              },
            },
          },
        },
      },
    });

    if (!sourceTrip) {
      throw new AppError("Public trip not found", 404);
    }

    // Clone trip and nested records inside transaction
    const clonedTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId: newUserId,
          name: `${sourceTrip.name} (Copy)`,
          description: sourceTrip.description,
          coverPhoto: sourceTrip.coverPhoto,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          isPublic: false,
          shareSlug: null,
        },
      });

      for (const section of sourceTrip.sections) {
        const clonedSection = await tx.section.create({
          data: {
            tripId: trip.id,
            cityId: section.cityId,
            order: section.order,
            startDate: section.startDate,
            endDate: section.endDate,
            budget: section.budget,
          },
        });

        for (const sa of section.sectionActivities) {
          await tx.sectionActivity.create({
            data: {
              sectionId: clonedSection.id,
              activityId: sa.activityId,
              scheduledDate: sa.scheduledDate,
              costSnapshot: sa.costSnapshot,
            },
          });
        }
      }

      return trip;
    });

    return ItineraryService.getTripItinerary(clonedTrip.id, newUserId);
  }
}
