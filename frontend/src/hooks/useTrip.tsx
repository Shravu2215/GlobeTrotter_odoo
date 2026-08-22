import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trip, Section, Activity } from "@/types/trip";

interface TripContextType {
  currentTrip: Trip | null;
  trips: Trip[];
  createTrip: (tripData: Omit<Trip, 'id' | 'sections' | 'totalBudget'>) => Promise<void>;
  addSection: (sectionData: Omit<Section, 'id' | 'activities'>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  removeSection: (sectionId: string) => void;
  addActivity: (sectionId: string, activityData: Omit<Activity, 'id'>) => void;
  removeActivity: (sectionId: string, activityId: string) => void;
  saveItinerary: () => Promise<void>;
  loadTrip: (tripId: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load trips from localStorage on mount
  useEffect(() => {
    const storedTrips = localStorage.getItem("globeTrotter_trips");
    if (storedTrips) {
      try {
        setTrips(JSON.parse(storedTrips));
      } catch (e) {
        console.error("Failed to parse trips", e);
      }
    }
    const storedCurrentTrip = sessionStorage.getItem("globeTrotter_currentTrip");
    if (storedCurrentTrip) {
      try {
        setCurrentTrip(JSON.parse(storedCurrentTrip));
      } catch (e) {
        console.error("Failed to parse current trip", e);
      }
    }
  }, []);

  // Sync currentTrip to sessionStorage
  useEffect(() => {
    if (currentTrip) {
      sessionStorage.setItem("globeTrotter_currentTrip", JSON.stringify(currentTrip));
    } else {
      sessionStorage.removeItem("globeTrotter_currentTrip");
    }
  }, [currentTrip]);

  // Sync trips to localStorage
  useEffect(() => {
    localStorage.setItem("globeTrotter_trips", JSON.stringify(trips));
  }, [trips]);

  const calculateTotalBudget = (sections: Section[]) => {
    return sections.reduce((sum, section) => sum + Number(section.budget), 0);
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'sections' | 'totalBudget'>) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(tripData)
      });
      if (!res.ok) throw new Error("Failed to create trip");
      const data = await res.json();
      setCurrentTrip({ ...data.data.trip, sections: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const addSection = (sectionData: Omit<Section, 'id' | 'activities'>) => {
    if (!currentTrip) return;
    const newSection: Section = {
      ...sectionData,
      id: crypto.randomUUID(),
      activities: []
    };
    
    const updatedSections = [...currentTrip.sections, newSection];
    setCurrentTrip({
      ...currentTrip,
      sections: updatedSections,
      totalBudget: calculateTotalBudget(updatedSections)
    });
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!currentTrip) return;
    const updatedSections = currentTrip.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    );
    setCurrentTrip({
      ...currentTrip,
      sections: updatedSections,
      totalBudget: calculateTotalBudget(updatedSections)
    });
  };

  const removeSection = (sectionId: string) => {
    if (!currentTrip) return;
    const updatedSections = currentTrip.sections.filter(s => s.id !== sectionId);
    setCurrentTrip({
      ...currentTrip,
      sections: updatedSections,
      totalBudget: calculateTotalBudget(updatedSections)
    });
  };

  const addActivity = (sectionId: string, activityData: Omit<Activity, 'id'>) => {
    if (!currentTrip) return;
    const newActivity: Activity = {
      ...activityData,
      id: crypto.randomUUID()
    };
    
    const updatedSections = currentTrip.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, activities: [...s.activities, newActivity] };
      }
      return s;
    });

    setCurrentTrip({
      ...currentTrip,
      sections: updatedSections
    });
  };

  const removeActivity = (sectionId: string, activityId: string) => {
    if (!currentTrip) return;
    const updatedSections = currentTrip.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, activities: s.activities.filter(a => a.id !== activityId) };
      }
      return s;
    });

    setCurrentTrip({
      ...currentTrip,
      sections: updatedSections
    });
  };

  const saveItinerary = async () => {
    if (!currentTrip) return;
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/trips/${currentTrip.id}/itinerary`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sections: currentTrip.sections })
      });
      if (!res.ok) throw new Error("Failed to save itinerary");
      
      // Optionally reload the trips list
      const tripRes = await fetch(`${baseUrl}/api/trips`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (tripRes.ok) {
        const tripData = await tripRes.json();
        setTrips(tripData.data.trips);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTrip = async (tripId: string) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/trips/${tripId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load trip");
      const data = await res.json();
      const trip = data.data.trip;
      
      // Map database destinations/attractions to frontend "sections" structure
      const sections = trip.destinations.map((d: any) => ({
        id: d.id,
        cityId: d.destinationId,
        cityName: d.destination.cityName,
        order: d.visitOrder,
        budget: 0, // Simplified, should ideally pull real cost here or rely on trip.totalBudget
        activities: trip.tripAttractions
          .filter((a: any) => a.tripDestinationId === d.id)
          .map((a: any) => ({
            id: a.attractionId,
            name: a.attraction.name,
            cost: a.attraction.entranceFee || 0,
            image: a.attraction.imageUrl,
            category: a.attraction.category,
            scheduledDate: a.scheduledDate
          }))
      }));
      
      setCurrentTrip({ ...trip, sections });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TripContext.Provider value={{
      currentTrip, trips, createTrip, addSection, updateSection, removeSection, addActivity, removeActivity, saveItinerary, loadTrip
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
