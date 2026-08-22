import { createApp } from "../app";
import { AuthService } from "../services/auth.service";
import { CityService } from "../services/city.service";
import { TripService } from "../services/trip.service";
import { SectionService } from "../services/section.service";
import { ItineraryService } from "../services/itinerary.service";
import { UserService } from "../services/user.service";
import { PublicService } from "../services/public.service";
import { AdminService } from "../services/admin.service";
import prisma from "../config/prisma";
import { seedDatabase } from "../../prisma/seed";

async function runEndToEndVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING GLOBETROTTER BACKEND WORKFLOW VERIFICATION");
  console.log("==================================================");

  try {
    // 0. Seed database
    console.log("\n[0/8] Seeding database with cities & activities...");
    await seedDatabase();

    // 1. Auth: Register, Login, GetMe
    console.log("\n[1/8] Testing Auth Workflow (Register, Login, Me)...");
    const testEmail = `traveler_${Date.now()}@example.com`;
    const testUsername = `globetrotter_${Date.now()}`;

    const regResult = await AuthService.register({
      firstName: "Elena",
      lastName: "Rostova",
      username: testUsername,
      email: testEmail,
      password: "SecurePassword123!",
      city: "San Francisco",
      country: "USA",
      language: "en",
    });

    console.log(`✅ Registered user: ${regResult.user.username} (${regResult.user.id})`);
    console.log(`✅ Token generated successfully: ${regResult.token.substring(0, 20)}...`);

    const loginResult = await AuthService.login({
      email: testEmail,
      password: "SecurePassword123!",
    });
    console.log(`✅ Logged in successfully: ${loginResult.user.email}`);

    const me = await AuthService.getMe(regResult.user.id);
    console.log(`✅ Fetched profile via getMe: ${me.firstName} ${me.lastName}`);

    // 2. City & Activity Search
    console.log("\n[2/8] Testing City and Activity Search (Public)...");
    const cities = await CityService.getCities({ search: "Paris" });
    console.log(`✅ Found ${cities.length} city matching 'Paris': ${cities[0]?.name}`);
    const paris = cities[0];

    const tokyoCities = await CityService.getCities({ search: "Tokyo" });
    const tokyo = tokyoCities[0];

    const parisActivities = await CityService.getCityActivities(paris.id, {});
    console.log(`✅ Found ${parisActivities.activities.length} activities in Paris:`);
    parisActivities.activities.forEach((a) =>
      console.log(`   - [${a.category}] ${a.name}: $${a.cost}`)
    );

    // 3. Trips: Create Trip, List Trips, Get Single Trip
    console.log("\n[3/8] Testing Trip Management...");
    const trip = await TripService.createTrip(regResult.user.id, {
      name: "Grand Euro-Asia Tour 2026",
      description: "Visiting Paris and Tokyo for culture, sights, and gastronomy",
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: "2026-10-20T00:00:00.000Z",
      isPublic: false,
    });
    console.log(`✅ Created Trip: ${trip.name} (${trip.id})`);

    const myTrips = await TripService.getMyTrips(regResult.user.id);
    console.log(`✅ Fetched My Trips list: ${myTrips.length} trip(s) found`);

    // 4. Sections & Activities: Add Section, Assign Activities, Reorder
    console.log("\n[4/8] Testing Section & Activity Management...");
    const section1 = await SectionService.addSection(regResult.user.id, trip.id, {
      cityId: paris.id,
      startDate: "2026-10-01T00:00:00.000Z",
      endDate: "2026-10-10T00:00:00.000Z",
      budget: 350.0, // Target budget
    });
    console.log(`✅ Added Section 1: ${section1.city.name} (Budget: $${section1.budget})`);

    const section2 = await SectionService.addSection(regResult.user.id, trip.id, {
      cityId: tokyo.id,
      startDate: "2026-10-11T00:00:00.000Z",
      endDate: "2026-10-20T00:00:00.000Z",
      budget: 400.0, // Target budget
    });
    console.log(`✅ Added Section 2: ${section2.city.name} (Budget: $${section2.budget})`);

    // Assign Paris activities
    const act1 = parisActivities.activities[0]; // Sightseeing / Activities
    const act2 = parisActivities.activities[2]; // Food / Meals
    const act3 = parisActivities.activities[3]; // Stay

    const sa1 = await SectionService.assignActivity(regResult.user.id, section1.id, {
      activityId: act1.id,
      scheduledDate: "2026-10-02T10:00:00.000Z",
    });
    console.log(`✅ Assigned activity 1: ${act1.name} (Snapshot cost: $${sa1.sectionActivity.costSnapshot})`);

    const sa2 = await SectionService.assignActivity(regResult.user.id, section1.id, {
      activityId: act2.id,
      scheduledDate: "2026-10-03T19:00:00.000Z",
    });
    console.log(`✅ Assigned activity 2: ${act2.name} (Snapshot cost: $${sa2.sectionActivity.costSnapshot})`);

    const sa3 = await SectionService.assignActivity(regResult.user.id, section1.id, {
      activityId: act3.id,
      scheduledDate: "2026-10-01T15:00:00.000Z",
    });
    console.log(`✅ Assigned activity 3: ${act3.name} (Snapshot cost: $${sa3.sectionActivity.costSnapshot})`);

    // Assign Tokyo activities
    const tokyoActivities = await CityService.getCityActivities(tokyo.id, {});
    const saTokyo1 = await SectionService.assignActivity(regResult.user.id, section2.id, {
      activityId: tokyoActivities.activities[0].id,
      scheduledDate: "2026-10-12T11:00:00.000Z",
    });
    console.log(`✅ Assigned Tokyo activity: ${tokyoActivities.activities[0].name} (Snapshot cost: $${saTokyo1.sectionActivity.costSnapshot})`);

    // 5. Itinerary View + Budget Calculations
    console.log("\n[5/8] Testing Complete Itinerary View & Budget Analytics...");
    const itinerary = await ItineraryService.getTripItinerary(trip.id, regResult.user.id);
    console.log(`✅ Total Target Budget: $${itinerary.totalBudget}`);
    console.log(`✅ Total Actual Spent: $${itinerary.totalSpent}`);
    console.log(`✅ Over Budget Flag: ${itinerary.overBudget}`);
    console.log("✅ Category Breakdown (Pie Chart data):");
    itinerary.categoryBreakdownList.forEach((c) => {
      console.log(`   - ${c.category}: $${c.amount} (${c.percentage}%)`);
    });
    console.log("✅ Sections Summary:");
    itinerary.sections.forEach((s) => {
      console.log(`   - Section ${s.city.name}: Budget $${s.budget} vs Spent $${s.spent} (Over budget: ${s.overBudget}) | Activities count: ${s.activities.length}`);
    });

    // 6. User Profile Update
    console.log("\n[6/8] Testing Profile Update...");
    const updatedProfile = await UserService.updateProfile(regResult.user.id, {
      firstName: "Elena (Verified Traveler)",
      city: "Kyoto",
      language: "ja",
    });
    console.log(`✅ Profile updated: ${updatedProfile.firstName}, City: ${updatedProfile.city}, Lang: ${updatedProfile.language}`);

    // 7. Publish, Community Feed & Copy Trip
    console.log("\n[7/8] Testing Trip Publish, Community Feed & Trip Copy...");
    const published = await PublicService.publishTrip(regResult.user.id, trip.id);
    console.log(`✅ Trip published with shareSlug: ${published.shareSlug}`);

    const publicItinerary = await PublicService.getPublicTripBySlug(published.shareSlug!);
    console.log(`✅ Fetched public trip itinerary without auth: ${publicItinerary.name} (${publicItinerary.sections.length} sections)`);

    const communityTrips = await PublicService.getCommunityTrips({});
    console.log(`✅ Community feed contains ${communityTrips.length} public trip(s)`);

    // Register second user and clone trip
    const user2 = await AuthService.register({
      firstName: "Marco",
      lastName: "Polo",
      username: `traveler2_${Date.now()}`,
      email: `marco_${Date.now()}@example.com`,
      password: "Password123!",
    });
    const copiedTrip = await PublicService.copyPublicTrip(published.shareSlug!, user2.user.id);
    console.log(`✅ Cloned trip for user 2: ${copiedTrip.name} (Owner: ${user2.user.username}, Sections: ${copiedTrip.sections.length})`);

    // 8. Admin Statistics
    console.log("\n[8/8] Testing Admin Analytics...");
    const adminStats = await AdminService.getStats();
    console.log(`✅ Platform stats: Users: ${adminStats.users}, Total Trips: ${adminStats.trips.total} (${adminStats.trips.public} public), Sections: ${adminStats.sections}`);
    console.log(`✅ Top cities count: ${adminStats.topCities.length}`);

    console.log("\n==================================================");
    console.log("🎉 ALL WORKFLOW TESTS (STEPS 1-8) COMPLETED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err: any) {
    console.error("❌ Workflow verification failed:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndVerification();
