import { useState, useEffect, useCallback } from 'react';
import { Trip, CommunityTrip } from '@/types/trip';

const STORAGE_KEY = 'globeTrotter_communityTrips';

// ── Mock seed data ──────────────────────────────────────────────────────────
const MOCK_COMMUNITY_TRIPS: CommunityTrip[] = [
  {
    id: 'mock-1',
    tripId: 'trip-mock-1',
    userId: 'user-sakura',
    isPublic: true,
    sharedAt: '2026-08-10T08:00:00Z',
    trip: {
      id: 'trip-mock-1',
      name: 'Tokyo Cherry Blossom Trail',
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      destination: 'Tokyo, Japan',
      description: 'Experience the magical sakura season with temple visits, street food, and anime culture.',
      totalBudget: 180000,
      isPublic: true,
      sharedAt: '2026-08-10T08:00:00Z',
      sections: [
        {
          id: 's1',
          city: 'Tokyo',
          country: 'Japan',
          startDate: '2026-04-01',
          endDate: '2026-04-05',
          budget: 100000,
          activities: [
            { id: 'a1', name: 'Shinjuku Gyoen Picnic', category: 'Nature', date: '2026-04-02', time: '10:00', cost: 500 },
            { id: 'a2', name: 'Senso-ji Temple', category: 'Historical', date: '2026-04-03', time: '09:00', cost: 0 },
            { id: 'a3', name: 'Akihabara Shopping', category: 'Shopping', date: '2026-04-04', time: '14:00', cost: 8000 },
          ],
        },
        {
          id: 's2',
          city: 'Kyoto',
          country: 'Japan',
          startDate: '2026-04-06',
          endDate: '2026-04-10',
          budget: 80000,
          activities: [
            { id: 'a4', name: 'Fushimi Inari Hike', category: 'Nature', date: '2026-04-07', time: '07:00', cost: 0 },
            { id: 'a5', name: 'Tea Ceremony', category: 'Sightseeing', date: '2026-04-08', time: '15:00', cost: 3500 },
          ],
        },
      ],
    },
  },
  {
    id: 'mock-2',
    tripId: 'trip-mock-2',
    userId: 'user-arjun',
    isPublic: true,
    sharedAt: '2026-08-14T10:30:00Z',
    trip: {
      id: 'trip-mock-2',
      name: 'Rajasthan Royal Road Trip',
      startDate: '2026-01-15',
      endDate: '2026-01-25',
      destination: 'Rajasthan, India',
      description: 'Palaces, deserts, and camels — a royal Indian adventure across the golden state.',
      totalBudget: 55000,
      isPublic: true,
      sharedAt: '2026-08-14T10:30:00Z',
      sections: [
        {
          id: 's3',
          city: 'Jaipur',
          country: 'India',
          startDate: '2026-01-15',
          endDate: '2026-01-19',
          budget: 20000,
          activities: [
            { id: 'a6', name: 'Amber Fort Tour', category: 'Historical', date: '2026-01-16', time: '09:00', cost: 1200 },
            { id: 'a7', name: 'Hawa Mahal Visit', category: 'Sightseeing', date: '2026-01-17', time: '11:00', cost: 200 },
          ],
        },
        {
          id: 's4',
          city: 'Jaisalmer',
          country: 'India',
          startDate: '2026-01-20',
          endDate: '2026-01-25',
          budget: 35000,
          activities: [
            { id: 'a8', name: 'Desert Safari', category: 'Adventure', date: '2026-01-21', time: '16:00', cost: 4500 },
            { id: 'a9', name: 'Camel Ride at Sunset', category: 'Adventure', date: '2026-01-22', time: '17:30', cost: 1500 },
          ],
        },
      ],
    },
  },
  {
    id: 'mock-3',
    tripId: 'trip-mock-3',
    userId: 'user-elena',
    isPublic: true,
    sharedAt: '2026-08-18T14:00:00Z',
    trip: {
      id: 'trip-mock-3',
      name: 'Amalfi Coast Dream',
      startDate: '2026-06-10',
      endDate: '2026-06-18',
      destination: 'Amalfi Coast, Italy',
      description: 'Cliffside villages, azure waters, limoncello, and the best pasta of your life.',
      totalBudget: 220000,
      isPublic: true,
      sharedAt: '2026-08-18T14:00:00Z',
      sections: [
        {
          id: 's5',
          city: 'Positano',
          country: 'Italy',
          startDate: '2026-06-10',
          endDate: '2026-06-14',
          budget: 120000,
          activities: [
            { id: 'a10', name: 'Boat Tour of the Coast', category: 'Adventure', date: '2026-06-11', time: '10:00', cost: 12000 },
            { id: 'a11', name: 'Path of the Gods Hike', category: 'Nature', date: '2026-06-12', time: '07:30', cost: 0 },
            { id: 'a12', name: 'Local Seafood Dinner', category: 'Food', date: '2026-06-13', time: '20:00', cost: 8000 },
          ],
        },
        {
          id: 's6',
          city: 'Ravello',
          country: 'Italy',
          startDate: '2026-06-15',
          endDate: '2026-06-18',
          budget: 100000,
          activities: [
            { id: 'a13', name: 'Villa Rufolo Gardens', category: 'Sightseeing', date: '2026-06-15', time: '10:00', cost: 800 },
            { id: 'a14', name: 'Cooking Class', category: 'Food', date: '2026-06-16', time: '15:00', cost: 5000 },
          ],
        },
      ],
    },
  },
  {
    id: 'mock-4',
    tripId: 'trip-mock-4',
    userId: 'user-kwame',
    isPublic: true,
    sharedAt: '2026-08-20T06:45:00Z',
    trip: {
      id: 'trip-mock-4',
      name: 'Bali Spirit & Surf',
      startDate: '2026-07-05',
      endDate: '2026-07-14',
      destination: 'Bali, Indonesia',
      description: 'Temples, rice terraces, surf lessons, and Ubud jungle retreats.',
      totalBudget: 95000,
      isPublic: true,
      sharedAt: '2026-08-20T06:45:00Z',
      sections: [
        {
          id: 's7',
          city: 'Seminyak',
          country: 'Indonesia',
          startDate: '2026-07-05',
          endDate: '2026-07-08',
          budget: 40000,
          activities: [
            { id: 'a15', name: 'Surf Lesson at Kuta', category: 'Adventure', date: '2026-07-06', time: '08:00', cost: 2500 },
            { id: 'a16', name: 'Sunset at Tanah Lot', category: 'Sightseeing', date: '2026-07-07', time: '17:00', cost: 500 },
          ],
        },
        {
          id: 's8',
          city: 'Ubud',
          country: 'Indonesia',
          startDate: '2026-07-09',
          endDate: '2026-07-14',
          budget: 55000,
          activities: [
            { id: 'a17', name: 'Tegalalang Rice Terraces', category: 'Nature', date: '2026-07-10', time: '09:00', cost: 0 },
            { id: 'a18', name: 'Monkey Forest', category: 'Nature', date: '2026-07-11', time: '10:00', cost: 800 },
            { id: 'a19', name: 'Traditional Cooking Class', category: 'Food', date: '2026-07-12', time: '14:00', cost: 3500 },
          ],
        },
      ],
    },
  },
];

// ── Hook ────────────────────────────────────────────────────────────────────
export function useCommunity() {
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as CommunityTrip[];
    } catch {
      // ignore parse errors
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMMUNITY_TRIPS));
    return MOCK_COMMUNITY_TRIPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(communityTrips));
    } catch {
      // ignore
    }
  }, [communityTrips]);

  const shareTrip = useCallback((trip: Trip): CommunityTrip => {
    const newEntry: CommunityTrip = {
      id: `community-${Date.now()}`,
      tripId: trip.id,
      userId: 'me',
      isPublic: true,
      sharedAt: new Date().toISOString(),
      trip: JSON.parse(JSON.stringify(trip)),
    };
    setCommunityTrips(prev => {
      const exists = prev.findIndex(ct => ct.tripId === trip.id);
      if (exists !== -1) {
        const updated = [...prev];
        updated[exists] = newEntry;
        return updated;
      }
      return [newEntry, ...prev];
    });
    return newEntry;
  }, []);

  const isTripShared = useCallback(
    (tripId: string) => communityTrips.some(ct => ct.tripId === tripId),
    [communityTrips],
  );

  const getCommunityTrip = useCallback(
    (id: string) => communityTrips.find(ct => ct.id === id) ?? null,
    [communityTrips],
  );

  return { communityTrips, shareTrip, isTripShared, getCommunityTrip };
}
