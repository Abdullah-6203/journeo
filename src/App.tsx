import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PlanTripPage } from './pages/PlanTripPage';
import { ItineraryResultPage } from './pages/ItineraryResultPage';
import { JourneyModePage } from './pages/JourneyModePage';
import { MyTripsPage } from './pages/MyTripsPage';
import { DestinationsListPage } from './pages/DestinationsListPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F7F4EA] text-[#302F29] flex flex-col font-sans selection:bg-sage/25 selection:text-deep-green">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/explore" element={<DestinationsListPage />} />
              <Route path="/destinations" element={<DestinationsListPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailPage />} />
              <Route path="/plan" element={<PlanTripPage />} />
              <Route path="/itinerary/preview" element={<ItineraryResultPage />} />
              <Route path="/journey" element={<JourneyModePage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/dashboard" element={<Navigate to="/my-trips" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
