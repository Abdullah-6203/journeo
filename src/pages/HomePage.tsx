import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Navigation,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Layers,
  Sliders,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { api } from '../services/api';
import { MapComponent } from '../components/MapComponent';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDestinations().then(data => {
      setDestinations(data.destinations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sampleStops = [
    { title: 'Red Fort', time: '09:20 - 11:20', tag: 'Mughal Citadel', duration: '120m' },
    { title: 'Jama Masjid', time: '11:35 - 12:35', tag: 'Grand Mosque', duration: '60m' },
    { title: "Humayun's Tomb", time: '13:00 - 14:30', tag: 'Charbagh Garden', duration: '90m' },
    { title: 'Qutub Minar', time: '15:05 - 16:35', tag: 'Victory Minaret', duration: '90m' }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION B: HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-6">
        {/* Background Editorial Image with Warm Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=2000&q=85"
            alt="Majestic Indian Heritage Architecture"
            className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          />
          {/* Subtle Warm Ivory & Sage Gradient Overlay to guarantee text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#223325]/85 via-[#344B38]/70 to-[#223325]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(#F7F4EA_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory/15 backdrop-blur-md border border-ivory/25 text-ivory text-xs font-medium tracking-wide">
              <Compass className="w-3.5 h-3.5 text-sage-light" />
              <span>Personalized AI Travel Companion for India</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#FDFBF7] leading-[1.12]">
                Every Journey Has a Story. <br />
                <span className="italic font-normal text-sage-light">Let’s Make Yours.</span>
              </h1>

              <p className="text-sm sm:text-base text-ivory/90 leading-relaxed max-w-xl font-normal">
                Discover meaningful destinations and experience travel designed around your interests, time and pace. Let Journeo turn your travel ideas into thoughtfully planned, adaptive journeys.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/plan"
                className="px-7 py-3.5 rounded-xl bg-deep-green hover:bg-deep-green-dark border border-sage/40 text-white font-semibold text-sm tracking-wide shadow-soft-lg hover:shadow-card-hover transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4 text-sage-light group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#destinations-section"
                className="px-7 py-3.5 rounded-xl bg-ivory/20 hover:bg-ivory/30 backdrop-blur-md border border-ivory/30 text-white font-semibold text-sm transition-all text-center"
              >
                Explore Destinations
              </a>
            </div>

            {/* Feature Indicators */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-xs font-medium text-ivory/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-light flex-shrink-0" />
                <span>Personalized Itineraries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-light flex-shrink-0" />
                <span>Smart Route Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-light flex-shrink-0" />
                <span>Adaptive Travel Planning</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Realistic Itinerary Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-ivory text-text rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/60 backdrop-blur-lg transform hover:-translate-y-1 transition-all duration-300">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-md">
                    Recommended Circuit
                  </span>
                  <h3 className="font-serif text-xl font-bold text-text mt-1.5">
                    Imperial Delhi Heritage
                  </h3>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sage" />
                    <span>Delhi • 1 Day • 4 Verified Monuments</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-subtle block font-medium">Optimization</span>
                  <span className="font-serif font-bold text-lg text-deep-green">96%</span>
                </div>
              </div>

              {/* Preference Tags */}
              <div className="flex items-center gap-1.5 py-3 flex-wrap">
                <span className="text-[10px] font-semibold bg-ivory-dark text-text-muted px-2.5 py-1 rounded-full border border-border">
                  🏛️ Ancient Architecture
                </span>
                <span className="text-[10px] font-semibold bg-ivory-dark text-text-muted px-2.5 py-1 rounded-full border border-border">
                  📜 UNESCO Sites
                </span>
                <span className="text-[10px] font-semibold bg-ivory-dark text-text-muted px-2.5 py-1 rounded-full border border-border">
                  ⚖️ Balanced Pace
                </span>
              </div>

              {/* Itinerary Stops Preview */}
              <div className="space-y-3 py-2">
                {sampleStops.map((stop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-border-subtle shadow-soft-sm text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-deep-green text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-text">{stop.title}</div>
                        <div className="text-[11px] text-text-subtle">{stop.tag}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] text-deep-green font-semibold">{stop.time}</div>
                      <div className="text-[10px] text-text-subtle">{stop.duration} stay</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-terracotta" />
                  <span>Total duration: 7h 15m</span>
                </span>
                <Link
                  to="/plan"
                  className="px-4 py-2 bg-sage hover:bg-sage-dark text-white text-xs font-semibold rounded-lg transition-colors shadow-soft-sm flex items-center gap-1"
                >
                  <span>Customize Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: HOW JOURNEO WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
            Intelligent Travel Planning
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text">
            How Journeo Works
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Four intuitive steps designed to transform unstructured travel ideas into seamless, adaptive reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft-sm hover:shadow-soft-md transition-all space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-sage/15 text-deep-green flex items-center justify-center font-serif text-xl font-bold">
              1
            </div>
            <h3 className="font-serif font-bold text-lg text-text">
              Tell Us Your Preferences
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Select interests like architecture, spiritual heritage, or culinary tours. Choose your travel pace and transport mode.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft-sm hover:shadow-soft-md transition-all space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-sage/15 text-deep-green flex items-center justify-center font-serif text-xl font-bold">
              2
            </div>
            <h3 className="font-serif font-bold text-lg text-text">
              Discover Destinations
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Browse curated and verified ASI / UNESCO monuments. Pick must-visit landmarks and filter out places you've seen.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft-sm hover:shadow-soft-md transition-all space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-sage/15 text-deep-green flex items-center justify-center font-serif text-xl font-bold">
              3
            </div>
            <h3 className="font-serif font-bold text-lg text-text">
              Generate Your Itinerary
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Our constraint-aware optimizer sequences stops to minimize traffic, respects ticket counter hours, and schedules dwell times.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-soft-sm hover:shadow-soft-md transition-all space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-terracotta/15 text-terracotta flex items-center justify-center font-serif text-xl font-bold">
              4
            </div>
            <h3 className="font-serif font-bold text-lg text-text">
              Explore & Adapt Live
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Activate Journey Mode on the road. If delayed at a palace, the adaptive replanner recalibrates downstream stops instantly.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION D: POPULAR DESTINATIONS */}
      <section id="destinations-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-dark bg-sage/15 px-3 py-1 rounded-full">
              Curated Royal Cities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text">
              Popular Destinations in India
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Centuries of craftsmanship, royal forts, and spiritual riverways documented with official citations.
            </p>
          </div>

          <Link
            to="/destinations"
            className="text-xs font-semibold text-deep-green hover:underline flex items-center gap-1"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl overflow-hidden border border-border shadow-soft-sm hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-deep-green">
                    {dest.city}
                  </div>
                  {dest.isMustVisit && (
                    <div className="absolute top-3 right-3 bg-terracotta text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                      Must Visit
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-sage-dark bg-sage/10 px-2 py-0.5 rounded">
                      {dest.category}
                    </span>
                    <span className="text-[11px] text-text-subtle">
                      ⏱️ {dest.averageVisitDuration} mins recommended
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-text group-hover:text-deep-green transition-colors leading-snug">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-text-subtle font-mono">
                  {dest.entryFeeINR === 0 ? 'Free Entry' : `₹${dest.entryFeeINR} Ticket`}
                </span>
                <Link
                  to={`/destinations/${dest.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-ivory-dark hover:bg-sage hover:text-white text-xs font-semibold text-text transition-colors"
                >
                  Explore Site
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION E: WHY CHOOSE JOURNEO */}
      <section className="bg-ivory-dark/70 py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green bg-deep-green/10 px-3 py-1 rounded-full">
              Platform Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text">
              Why Travelers Choose Journeo
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Built to solve unstructured travel planning with personalization and real-world resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-border shadow-soft-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 text-deep-green flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-text">
                Interest-Based Discovery
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Filter destinations precisely by your passions—from Mughal double-dome geometry to hidden stone stepwells.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-border shadow-soft-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage/15 text-deep-green flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-text">
                Intelligently Optimized Routes
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Eliminates zigzagging across chaotic city traffic with greedy nearest-neighbor sequencing and dwell schedules.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-border shadow-soft-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/15 text-terracotta flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-text">
                Adaptive Delay Replanning
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                When you stay an extra hour at the Red Fort, Journeo dynamically reshapes your afternoon stops to safeguard closing gates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION F: SAMPLE ITINERARY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-border p-8 sm:p-12 shadow-soft-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
              Live Showcase
            </span>
            <h2 className="font-serif text-3xl font-bold text-text">
              Experience the Full-Featured Itinerary Interface
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Journeo integrates structured chronological schedules with responsive map routes and journey tracking mode.
            </p>

            <div className="space-y-3 text-xs text-text">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-deep-green" />
                <span>Verified ASI & UNESCO monument citations</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-deep-green" />
                <span>Real-time travel duration calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-deep-green" />
                <span>1-click adaptive delay simulation & strategy apply</span>
              </div>
            </div>

            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-semibold shadow-soft-sm transition-colors"
            >
              <span>Build Your Own Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden border border-border shadow-soft-md">
              <MapComponent
                markers={[
                  { id: '1', lat: 28.6562, lng: 77.2410, title: 'Red Fort', order: 1, isMustVisit: true, timing: '09:20 - 11:20' },
                  { id: '2', lat: 28.6507, lng: 77.2334, title: 'Jama Masjid', order: 2, timing: '11:35 - 12:35' },
                  { id: '3', lat: 28.5933, lng: 77.2507, title: "Humayun's Tomb", order: 3, isMustVisit: true, timing: '13:00 - 14:30' },
                  { id: '4', lat: 28.5245, lng: 77.1855, title: 'Qutub Minar', order: 4, isMustVisit: true, timing: '15:05 - 16:35' }
                ]}
                height="380px"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
