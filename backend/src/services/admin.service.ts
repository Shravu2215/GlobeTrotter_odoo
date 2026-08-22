import prisma from "../config/prisma";

export class AdminService {
  static async getStats() {
    const [userCount, tripCount, publicTripCount, sectionCount, topCities, topActivities] =
      await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.trip.count({ where: { isPublic: true } }),
        prisma.section.count(),
        prisma.city.findMany({
          take: 5,
          orderBy: { popularity: "desc" },
          select: {
            id: true,
            name: true,
            country: true,
            costIndex: true,
            popularity: true,
            _count: {
              select: { sections: true },
            },
          },
        }),
        prisma.activity.findMany({
          take: 5,
          orderBy: {
            sectionActivities: {
              _count: "desc",
            },
          },
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            cost: true,
            city: {
              select: { name: true, country: true },
            },
            _count: {
              select: { sectionActivities: true },
            },
          },
        }),
      ]);

    return {
      users: userCount,
      trips: {
        total: tripCount,
        public: publicTripCount,
        private: tripCount - publicTripCount,
      },
      sections: sectionCount,
      topCities,
      topActivities,
    };
  }
}
