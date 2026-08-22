import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import {
  CreateSectionInput,
  UpdateSectionInput,
  AssignActivityInput,
} from "../validators/section.validator";

export class SectionService {
  static async addSection(userId: string, tripId: string, input: CreateSectionInput) {
    // 1. Verify trip exists and belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    // 2. Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: input.cityId },
    });

    if (!city) {
      throw new AppError("City not found", 404);
    }

    // 3. Compute next order value
    const lastSection = await prisma.section.findFirst({
      where: { tripId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastSection ? lastSection.order + 1 : 0;

    // 4. Create section
    const section = await prisma.section.create({
      data: {
        tripId,
        cityId: input.cityId,
        order: nextOrder,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: input.budget,
      },
      include: {
        city: true,
        sectionActivities: {
          include: {
            activity: true,
          },
        },
      },
    });

    return section;
  }

  static async updateSection(userId: string, sectionId: string, input: UpdateSectionInput) {
    // 1. Verify section and ownership via parent trip
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section || section.trip.userId !== userId) {
      throw new AppError("Section not found", 404);
    }

    // 2. Verify city if changed
    if (input.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: input.cityId },
      });
      if (!city) {
        throw new AppError("City not found", 404);
      }
    }

    // 3. Update section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(input.cityId !== undefined ? { cityId: input.cityId } : {}),
        ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
        ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
        ...(input.budget !== undefined ? { budget: input.budget } : {}),
      },
      include: {
        city: true,
        sectionActivities: {
          include: {
            activity: true,
          },
          orderBy: { scheduledDate: "asc" },
        },
      },
    });

    return updatedSection;
  }

  static async deleteSection(userId: string, sectionId: string) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section || section.trip.userId !== userId) {
      throw new AppError("Section not found", 404);
    }

    const tripId = section.tripId;

    await prisma.section.delete({
      where: { id: sectionId },
    });

    return {
      success: true,
      message: "Section deleted successfully",
      tripId,
    };
  }

  static async reorderSections(userId: string, tripId: string, sectionIds: string[]) {
    // 1. Verify trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: { sections: true },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    // 2. Verify that all provided sectionIds belong to this trip
    const existingSectionIds = new Set(trip.sections.map((s) => s.id));
    for (const sId of sectionIds) {
      if (!existingSectionIds.has(sId)) {
        throw new AppError(`Section ${sId} does not belong to this trip`, 400);
      }
    }

    // 3. Execute updates in a transaction
    await prisma.$transaction(
      sectionIds.map((id, index) =>
        prisma.section.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    // 4. Return updated ordered sections
    const updatedSections = await prisma.section.findMany({
      where: { tripId },
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
    });

    return updatedSections;
  }

  static async assignActivity(userId: string, sectionId: string, input: AssignActivityInput) {
    // 1. Verify section and parent trip ownership
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section || section.trip.userId !== userId) {
      throw new AppError("Section not found", 404);
    }

    // 2. Verify activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: input.activityId },
    });

    if (!activity) {
      throw new AppError("Activity not found", 404);
    }

    // 3. Snapshot activity cost upon addition
    const sectionActivity = await prisma.sectionActivity.create({
      data: {
        sectionId,
        activityId: input.activityId,
        scheduledDate: new Date(input.scheduledDate),
        costSnapshot: activity.cost, // Snapshot cost
      },
      include: {
        activity: true,
      },
    });

    return {
      sectionActivity,
      tripId: section.tripId,
      sectionId: section.id,
    };
  }

  static async removeActivity(userId: string, sectionId: string, sectionActivityId: string) {
    // 1. Verify section and parent trip ownership
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { trip: true },
    });

    if (!section || section.trip.userId !== userId) {
      throw new AppError("Section not found", 404);
    }

    // 2. Verify sectionActivity exists in this section
    const sectionActivity = await prisma.sectionActivity.findFirst({
      where: {
        id: sectionActivityId,
        sectionId,
      },
    });

    if (!sectionActivity) {
      throw new AppError("Activity assignment not found in this section", 404);
    }

    await prisma.sectionActivity.delete({
      where: { id: sectionActivityId },
    });

    return {
      success: true,
      message: "Activity removed from section",
      tripId: section.tripId,
      sectionId: section.id,
    };
  }
}
