export interface Activity {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  cost: number;
  image?: string;
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
}
