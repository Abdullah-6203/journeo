import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { RequireAuth } from './components/RequireAuth';

import { HomePage } from './pages/HomePage';
import { PlanTripPage } from './pages/PlanTripPage';
import { ItineraryResultPage } from './pages/ItineraryResultPage';
import { JourneyModePage } from './pages/JourneyModePage';
import { MyTripsPage } from './pages/MyTripsPage';
import { DestinationsListPage } from './pages/DestinationsListPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F7F4EA] text-[#302F29] flex flex-col font-sans selection:bg-sage/25 selection:text-deep-green">
          <Navbar onOpenAuth={openAuth} />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/destinations" element={<DestinationsListPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailPage />} />
              <Route path="/plan" element={<PlanTripPage />} />
              <Route path="/itinerary/preview" element={<ItineraryResultPage />} />
              <Route path="/journey" element={<JourneyModePage />} />
              <Route
                path="/my-trips"
                element={
                  <RequireAuth>
                    <MyTripsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                }
              />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialMode={authMode}
          />
        </div>
      </BrowserRouter>
    </TripProvider>
  </AuthProvider>
);
};
