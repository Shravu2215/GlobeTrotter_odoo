const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding travel data...");

    // -------------------------
    // Cities
    // -------------------------
    const cities = [
        {
            name: "Paris",
            country: "France",
            region: "Europe",
            description: "The city of lights, art, culture and iconic landmarks.",
            costIndex: 4,
            popularity: 95,
        },
        {
            name: "Rome",
            country: "Italy",
            region: "Europe",
            description: "Historic city famous for ancient architecture and culture.",
            costIndex: 3,
            popularity: 92,
        },
        {
            name: "Dubai",
            country: "United Arab Emirates",
            region: "Middle East",
            description: "A modern destination known for luxury and architecture.",
            costIndex: 4,
            popularity: 94,
        },
        {
            name: "Tokyo",
            country: "Japan",
            region: "Asia",
            description: "A vibrant mix of technology, tradition, food and culture.",
            costIndex: 4,
            popularity: 93,
        },
        {
            name: "Goa",
            country: "India",
            region: "Asia",
            description: "A popular destination for beaches and relaxation.",
            costIndex: 2,
            popularity: 90,
        },
        {
            name: "London",
            country: "United Kingdom",
            region: "Europe",
            description: "A global city famous for history and culture.",
            costIndex: 5,
            popularity: 96,
        },
    ];

    for (const city of cities) {
        const existingCity = await prisma.city.findFirst({
            where: {
                name: city.name,
                country: city.country,
            },
        });

        if (existingCity) {
            await prisma.city.update({
                where: { id: existingCity.id },
                data: city,
            });
        } else {
            await prisma.city.create({
                data: city,
            });
        }
    }

    console.log(`✓ ${cities.length} cities ready`);

    // -------------------------
    // Activities
    // -------------------------
    const activities = [
        {
            name: "Eiffel Tower Visit",
            description: "Visit the iconic Eiffel Tower and enjoy panoramic views.",
            category: "Sightseeing",
            duration: 120,
            estimatedCost: 35,
        },
        {
            name: "Louvre Museum",
            description: "Explore one of the world's most famous art museums.",
            category: "Culture",
            duration: 180,
            estimatedCost: 25,
        },
        {
            name: "Colosseum Tour",
            description: "Explore the ancient Roman Colosseum.",
            category: "History",
            duration: 150,
            estimatedCost: 30,
        },
        {
            name: "Dubai Desert Safari",
            description: "Experience dune bashing and the Arabian desert.",
            category: "Adventure",
            duration: 240,
            estimatedCost: 75,
        },
        {
            name: "Tokyo Food Tour",
            description: "Explore Tokyo through its famous local food.",
            category: "Food",
            duration: 180,
            estimatedCost: 60,
        },
        {
            name: "Goa Beach Day",
            description: "Relax and enjoy a full day at one of Goa's beaches.",
            category: "Relaxation",
            duration: 300,
            estimatedCost: 20,
        },
        {
            name: "London City Tour",
            description: "Explore London's famous landmarks.",
            category: "Sightseeing",
            duration: 180,
            estimatedCost: 40,
        },
    ];

    for (const activity of activities) {
        const existingActivity = await prisma.activity.findFirst({
            where: {
                name: activity.name,
            },
        });

        if (existingActivity) {
            await prisma.activity.update({
                where: { id: existingActivity.id },
                data: activity,
            });
        } else {
            await prisma.activity.create({
                data: activity,
            });
        }
    }

    console.log(`✓ ${activities.length} activities ready`);

    console.log("✅ Seed completed successfully!");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });