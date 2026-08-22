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
import Community from "@/pages/Community";
import SharedItineraryView from "@/pages/SharedItineraryView";
import MyTrips from "@/pages/MyTrips";
import Profile from "@/pages/Profile";
import Explore from "@/pages/Explore";
import CalendarView from "@/pages/CalendarView";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/view" element={<SharedItineraryView />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/itinerary" element={<ItineraryBuilder />} />
              <Route path="/view-itinerary" element={<ViewItinerary />} />
              <Route path="/budget" element={<BudgetView />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
