import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  Play,
  Trash2,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>('UPCOMING');
  const [tripsData, setTripsData] = useState<any>({ upcoming: [], ongoing: [], completed: [], all: [] });
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await api.getTrips();
        setTripsData(res.categorized || { upcoming: [], ongoing: [], completed: [] });
      } else {
        // Fallback demo trip from seed or session
        const cached = sessionStorage.getItem('journeo_generated_plan');
        const demoTrip = cached ? JSON.parse(cached) : null;
        if (demoTrip) {
          setTripsData({
            upcoming: [{
              id: 'demo_trip_1',
              title: demoTrip.title || 'Delhi Royal Heritage Circuit',
              destinationCity: demoTrip.destinationCity || 'Delhi',
              startDate: demoTrip.tripConfig?.startDate || '2026-11-10',
              status: 'UPCOMING',
              stops: demoTrip.plan?.scheduledStops || demoTrip.stops || [],
              optimizationScore: demoTrip.plan?.optimizationScore || 96,
              totalDistanceKm: demoTrip.plan?.totalDistanceKm || 20.9
            }],
            ongoing: [],
            completed: []
          });
        }
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.deleteTrip(id);
      fetchTrips();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleOpenTrip = (trip: any) => {
    sessionStorage.setItem('journeo_generated_plan', JSON.stringify({
      title: trip.title,
      destinationCity: trip.destinationCity,
      stops: trip.stops,
      plan: {
        scheduledStops: trip.stops,
        totalDistanceKm: trip.totalDistanceKm,
        totalDurationMin: trip.totalDurationMin,
        optimizationScore: trip.optimizationScore
      },
      tripConfig: {
        city: trip.destinationCity,
        startDate: trip.startDate,
        startingLocation: trip.startingLocation,
        budget: trip.budget,
        transportation: trip.transportation,
        travelStyle: trip.travelStyle
      },
      tripId: trip.id
    }));
    navigate('/itinerary/preview');
  };

  const currentList = activeTab === 'UPCOMING'
    ? tripsData.upcoming
    : activeTab === 'ONGOING'
    ? tripsData.ongoing
    : tripsData.completed;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-2.5 py-0.5 rounded-full">
            Travel Dashboard
          </span>
          <h1 className="font-serif text-3xl font-bold text-text mt-1">
            My Journeys
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your upcoming, active, and completed personalized itineraries.
          </p>
        </div>

        <Link
          to="/plan"
          className="px-5 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white text-xs font-bold transition-all shadow-soft-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: 'UPCOMING', label: 'Upcoming Trips', count: tripsData.upcoming?.length || 0 },
          { id: 'ONGOING', label: 'Ongoing Journey', count: tripsData.ongoing?.length || 0 },
          { id: 'COMPLETED', label: 'Completed Journeys', count: tripsData.completed?.length || 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-deep-green text-white shadow-soft-sm'
                : 'bg-ivory text-text-muted hover:text-text'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-ivory-dark text-text-subtle'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Trip Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-text-muted">
          Loading your travel itineraries...
        </div>
      ) : currentList && currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((trip: any) => (
            <div
              key={trip.id}
              onClick={() => handleOpenTrip(trip)}
              className="bg-white rounded-3xl border border-border p-6 shadow-soft-sm hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-md">
                    {trip.destinationCity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-deep-green">
                      {trip.optimizationScore || 95}% Score
                    </span>
                    {user && (
                      <button
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        className="text-text-subtle hover:text-terracotta p-1"
                        title="Delete trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-text group-hover:text-deep-green transition-colors">
                  {trip.title}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sage" />
                    <span>Travel Date: {trip.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sage" />
                    <span>{trip.stops?.length || 4} Curated Stops ({trip.totalDistanceKm || 20.9} km)</span>
                  </div>
                </div>
              </div>

              {/* Stop Thumbnails Strip */}
              {trip.stops && trip.stops.length > 0 && (
                <div className="flex items-center gap-2 overflow-hidden py-1">
                  {trip.stops.slice(0, 4).map((s: any, idx: number) => (
                    <img
                      key={idx}
                      src={s.destination?.imageUrl || 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=400&q=80'}
                      alt="Stop"
                      className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                  ))}
                  {trip.stops.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-ivory-dark flex items-center justify-center text-xs font-bold text-text-muted flex-shrink-0 border border-border">
                      +{trip.stops.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-deep-green group-hover:underline flex items-center gap-1">
                  <span>View & Manage Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-ivory text-text-subtle">
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sage/15 text-deep-green flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-text">
              No {activeTab.toLowerCase()} trips found
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Start planning your journey and save customized heritage circuits directly to your profile.
            </p>
          </div>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-semibold shadow-soft-sm transition-colors"
          >
            <Sparkles className="w-4 h-4 text-sage-light" />
            <span>Create Your First Trip</span>
          </Link>
        </div>
      )}
    </div>
  );
};
