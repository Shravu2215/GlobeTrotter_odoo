import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trip, Section, Activity } from "@/types/trip";

interface TripContextType {
  currentTrip: Trip | null;
  trips: Trip[];
  createTrip: (tripData: Omit<Trip, 'id' | 'sections' | 'totalBudget'>) => void;
  addSection: (sectionData: Omit<Section, 'id' | 'activities'>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  removeSection: (sectionId: string) => void;
  addActivity: (sectionId: string, activityData: Omit<Activity, 'id'>) => void;
  removeActivity: (sectionId: string, activityId: string) => void;
  saveItinerary: () => void;
  loadTrip: (tripId: string) => void;
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

  const createTrip = (tripData: Omit<Trip, 'id' | 'sections' | 'totalBudget'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: crypto.randomUUID(),
      sections: [],
      totalBudget: 0
    };
    setCurrentTrip(newTrip);
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

  const saveItinerary = () => {
    if (!currentTrip) return;
    
    // Check if trip exists, update or add
    setTrips(prev => {
      const exists = prev.findIndex(t => t.id === currentTrip.id);
      if (exists >= 0) {
        const newTrips = [...prev];
        newTrips[exists] = currentTrip;
        return newTrips;
      }
      return [...prev, currentTrip];
    });
  };

  const loadTrip = (tripId: string) => {
    const tripToLoad = trips.find(t => t.id === tripId);
    if (tripToLoad) {
      setCurrentTrip(tripToLoad);
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
