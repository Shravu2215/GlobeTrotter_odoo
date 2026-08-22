import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TripProvider } from "@/hooks/useTrip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import CreateTrip from "@/pages/CreateTrip";
import ItineraryBuilder from "@/pages/ItineraryBuilder";
import ViewItinerary from "@/pages/ViewItinerary";
import BudgetView from "@/pages/BudgetView";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Landing />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/itinerary" element={<ItineraryBuilder />} />
            <Route path="/view-itinerary" element={<ViewItinerary />} />
            <Route path="/budget" element={<BudgetView />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
