export interface Activity {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  cost: number;
  image?: string;
  duration?: string;
  openTime?: string;
  closeTime?: string;
  operatingHours?: string;
  locationArea?: string;
}

export interface Section {
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  activities: Activity[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: string;
  description: string;
  coverImage?: string;
  sections: Section[];
  totalBudget: number;
  isPublic?: boolean;
  sharedAt?: string;
}

/** Represents a trip shared to the Community. Wraps a full Trip snapshot. */
export interface CommunityTrip {
  id: string;          // unique community-share record id
  tripId: string;      // original trip id
  userId: string;      // sharer identifier (mock: "me" for current user)
  isPublic: boolean;
  sharedAt: string;    // ISO date string
  trip: Trip;          // full trip snapshot at share-time
}
