import { Role, ActivityType, ActivityCategory } from "@prisma/client";

export interface TokenPayload {
  id: string;
  role: Role;
  email: string;
  username: string;
}

export interface SanitizedUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  photo?: string | null;
  language: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryBreakdownItem {
  category: ActivityCategory;
  amount: number;
  percentage: number;
}

export interface ItinerarySectionActivityResponse {
  id: string;
  sectionId: string;
  activityId: string;
  scheduledDate: string;
  costSnapshot: number;
  activity: {
    id: string;
    name: string;
    type: ActivityType;
    category: ActivityCategory;
    cost: number;
    durationMinutes: number;
    description?: string | null;
    imageUrl?: string | null;
  };
}

export interface ItinerarySectionResponse {
  id: string;
  tripId: string;
  cityId: string;
  order: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  overBudget: boolean;
  city: {
    id: string;
    name: string;
    country: string;
    costIndex: number;
    popularity: number;
    imageUrl?: string | null;
  };
  activities: ItinerarySectionActivityResponse[];
}

export interface ItineraryResponse {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  coverPhoto?: string | null;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  shareSlug?: string | null;
  totalBudget: number;
  totalSpent: number;
  overBudget: boolean;
  categoryBreakdown: Record<ActivityCategory, number>;
  categoryBreakdownList: CategoryBreakdownItem[];
  sections: ItinerarySectionResponse[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    photo?: string | null;
  };
}
