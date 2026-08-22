import { ActivityCategory } from "@prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import {
  ItineraryResponse,
  ItinerarySectionResponse,
  CategoryBreakdownItem,
} from "../types";

export class ItineraryService {
  static async getTripItinerary(
    tripId: string,
    requestingUserId?: string
  ): Promise<ItineraryResponse> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
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
            sectionActivities: {
              include: {
                activity: true,
              },
              orderBy: { scheduledDate: "asc" },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    // Access check: Only owner or public trips can be viewed
    const isOwner = requestingUserId && trip.userId === requestingUserId;
    if (!isOwner && !trip.isPublic) {
      throw new AppError("Trip not found", 404);
    }

    // Category breakdown accumulator
    const categoryBreakdown: Record<ActivityCategory, number> = {
      TRANSPORT: 0,
      STAY: 0,
      ACTIVITIES: 0,
      MEALS: 0,
    };

    let totalBudget = 0;
    let totalSpent = 0;

    const sections: ItinerarySectionResponse[] = trip.sections.map((section) => {
      const sectionBudget = Number(section.budget);
      totalBudget += sectionBudget;

      let sectionSpent = 0;

      const activities = section.sectionActivities.map((sa) => {
        const cost = Number(sa.costSnapshot);
        sectionSpent += cost;

        const cat = sa.activity.category;
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat] += cost;
        } else {
          categoryBreakdown[cat] = cost;
        }

        return {
          id: sa.id,
          sectionId: sa.sectionId,
          activityId: sa.activityId,
          scheduledDate: sa.scheduledDate.toISOString(),
          costSnapshot: cost,
          activity: {
            id: sa.activity.id,
            name: sa.activity.name,
            type: sa.activity.type,
            category: sa.activity.category,
            cost: Number(sa.activity.cost),
            durationMinutes: sa.activity.durationMinutes,
            description: sa.activity.description,
            imageUrl: sa.activity.imageUrl,
          },
        };
      });

      totalSpent += sectionSpent;

      return {
        id: section.id,
        tripId: section.tripId,
        cityId: section.cityId,
        order: section.order,
        startDate: section.startDate.toISOString(),
        endDate: section.endDate.toISOString(),
        budget: sectionBudget,
        spent: Number(sectionSpent.toFixed(2)),
        overBudget: sectionSpent > sectionBudget,
        city: {
          id: section.city.id,
          name: section.city.name,
          country: section.city.country,
          costIndex: section.city.costIndex,
          popularity: section.city.popularity,
          imageUrl: section.city.imageUrl,
        },
        activities,
      };
    });

    // Format category breakdown list with percentages
    const categoryBreakdownList: CategoryBreakdownItem[] = (
      Object.keys(categoryBreakdown) as ActivityCategory[]
    ).map((cat) => {
      const amount = Number(categoryBreakdown[cat].toFixed(2));
      const percentage =
        totalSpent > 0 ? Number(((amount / totalSpent) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        amount,
        percentage,
      };
    });

    return {
      id: trip.id,
      userId: trip.userId,
      name: trip.name,
      description: trip.description,
      coverPhoto: trip.coverPhoto,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      isPublic: trip.isPublic,
      shareSlug: trip.shareSlug,
      totalBudget: Number(totalBudget.toFixed(2)),
      totalSpent: Number(totalSpent.toFixed(2)),
      overBudget: totalSpent > totalBudget,
      categoryBreakdown: {
        TRANSPORT: Number(categoryBreakdown.TRANSPORT.toFixed(2)),
        STAY: Number(categoryBreakdown.STAY.toFixed(2)),
        ACTIVITIES: Number(categoryBreakdown.ACTIVITIES.toFixed(2)),
        MEALS: Number(categoryBreakdown.MEALS.toFixed(2)),
      },
      categoryBreakdownList,
      sections,
      user: trip.user,
    };
  }
}
