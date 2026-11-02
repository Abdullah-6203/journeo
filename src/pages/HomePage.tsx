import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Calendar,
  Layers,
  ShieldCheck,
  RotateCcw,
  Award,
  ChevronRight,
  Car
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1);

  const startPlanningLink = user ? '/plan' : '/login?redirect=/plan';

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const day1Stops = [
    {
      title: 'Amber Fort & Palace',
      timing: '09:00 - 11:30',
      duration: '2h 30m',
      tag: 'Rajput Architecture',
      distance: 'Starting Point'
    },
    {
      title: 'City Palace of Jaipur',
      timing: '12:30 - 14:15',
      duration: '1h 45m',
      tag: 'Royal Courtyards',
      distance: '9.2 km transit'
    },
    {
      title: 'Hawa Mahal (Palace of Winds)',
      timing: '15:00 - 16:15',
      duration: '1h 15m',
      tag: 'Pink Sandstone Façade',
      distance: '1.1 km transit'
    }
  ];

  const day2Stops = [
    {
      title: 'Jantar Mantar Observatory',
      timing: '09:30 - 11:00',
      duration: '1h 30m',
      tag: 'UNESCO Astronomical Site',
      distance: 'Starting Point'
    },
    {
      title: 'Albert Hall Museum',
      timing: '12:00 - 14:00',
      duration: '2h 00m',
      tag: 'Indo-Saracenic Art',
      distance: '2.8 km transit'
    },
    {
      title: 'Patrika Gate & Jawahar Circle',
      timing: '15:30 - 16:45',
      duration: '1h 15m',
      tag: 'Hand-Painted Frescoes',
      distance: '8.4 km transit'
    }
  ];

  const workflowSteps = [
    {
      number: '01',
      title: 'Sign Up & Set Preferences',
      description: 'Create your account and specify your travel pace, cultural interests, budget, and transportation style.',
      icon: Sliders
    },
    {
      number: '02',
      title: 'Select Destination & Configure Trip',
      description: 'Choose your destination city, travel duration, daily starting hours, and accommodation hub.',
      icon: Calendar
    },
    {
      number: '03',
      title: 'Discover & Select Destinations',
      description: 'Explore curated heritage monuments, UNESCO landmarks, and hand-pick your priority must-visit sites.',
      icon: Compass
    },
    {
      number: '04',
      title: 'Generate & Optimise Itinerary',
      description: "Journeo's constraint-aware engine eliminates traffic backtracking and calculates ideal dwell durations.",
      icon: Sparkles
    },
    {
      number: '05',
      title: 'Review, Customise & Start Trip',
      description: 'Inspect the sequenced timeline, adjust stop orders or timings on interactive maps, and launch your journey.',
      icon: Navigation
    },
    {
      number: '06',
      title: 'Track Visits & Monitor Progress',
      description: 'Mark stops as completed or in-progress on the go, tracking real-time departure and arrival benchmarks.',
      icon: Layers
    },
    {
      number: '07',
      title: 'Adapt & Replan Journey',
      description: 'Delayed at a palace? Trigger 1-click adaptive replanning to protect downstream monument closing times.',
      icon: RotateCcw
    },
    {
      number: '08',
      title: 'Complete & Save Trip',
      description: 'Archive your finished journey, review travel metrics, and preserve your curated route in your personal vault.',
      icon: Award
    }
  ];

  return (
    <div className="space-y-28 pb-20 bg-[#F7F4EA]">
      {/* =========================================================================
          HERO SECTION — SPACIOUS TWO-COLUMN EDITORIAL LAYOUT
          ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Decorative subtle background accents */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* -------------------------------------------------------------------
              LEFT COLUMN — Main Content
              ------------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-7">
            {/* Introductory Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory-dark border border-border shadow-soft-sm text-deep-green text-xs font-semibold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5 text-terracotta" />
              <span>YOUR PERSONAL TRAVEL COMPANION</span>
            </div>

            {/* Exact Heading */}
            <div className="space-y-4">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-text leading-[1.12]">
                Make your plans <br />
                <span className="italic font-normal text-deep-green">with Journeo</span>
              </h1>

              {/* Supporting Value Proposition */}
              <p className="text-base sm:text-lg text-text-muted leading-relaxed font-normal max-w-xl">
                Personalized itineraries, intelligent route optimization, and real-time adaptive replanning. Travel at your own pace while Journeo seamlessly coordinates every detail.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to={startPlanningLink}
                className="px-8 py-4 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white font-semibold text-sm tracking-wide shadow-soft-lg hover:shadow-card-hover transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4 text-sage-light group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="px-8 py-4 rounded-xl bg-white hover:bg-ivory-dark border border-border text-text font-semibold text-sm transition-all shadow-soft-sm flex items-center justify-center gap-2"
              >
                <span>Explore Journeo</span>
                <ChevronRight className="w-4 h-4 text-text-subtle" />
              </button>
            </div>

            {/* Subtle Feature Indicators */}
            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-text">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
                <span>Personalized Itineraries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
                <span>Smart Route Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
                <span>Adaptive Travel Planning</span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
              RIGHT COLUMN — Travel Preview Multi-Card Composition
              ------------------------------------------------------------------- */}
          <div className="lg:col-span-6 relative">
            <div className="relative space-y-4">
              {/* CARD 1: Main Itinerary Preview */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-border shadow-soft-lg backdrop-blur-md transition-all hover:shadow-card-hover">
                {/* Header with Day Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                        Curated Circuit
                      </span>
                      <span className="text-[11px] text-text-subtle">• 2 Days • 6 Sites</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-text mt-1">
                      Your Jaipur Journey
                    </h3>
                  </div>

                  {/* Day Tabs */}
                  <div className="flex items-center bg-ivory-dark p-1 rounded-xl border border-border self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(1)}
                      className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        selectedDay === 1
                          ? 'bg-deep-green text-white shadow-soft-sm'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      Day 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDay(2)}
                      className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        selectedDay === 2
                          ? 'bg-deep-green text-white shadow-soft-sm'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      Day 2
                    </button>
                  </div>
                </div>

                {/* Timeline Stops */}
                <div className="space-y-3 py-4">
                  {(selectedDay === 1 ? day1Stops : day2Stops).map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF7] border border-border-subtle hover:border-sage/40 transition-colors shadow-soft-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-deep-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-text leading-snug">
                            {stop.title}
                          </div>
                          <div className="text-[11px] text-text-subtle flex items-center gap-1.5 mt-0.5">
                            <span className="text-sage-dark font-medium">{stop.tag}</span>
                            <span>•</span>
                            <span>{stop.distance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-[11px] sm:text-xs text-deep-green font-semibold">
                          {stop.timing}
                        </div>
                        <div className="text-[10px] text-text-subtle font-medium">
                          {stop.duration} stay
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card 1 Footer Summary */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    <span>Total duration: 7h 15m</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-deep-green">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Optimized for opening hours</span>
                  </span>
                </div>
              </div>

              {/* TWO FLOATING SUB-CARDS (PREFERENCES & ROUTE PREVIEW) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CARD 2: Your Preferences Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-border shadow-soft-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle">
                      Your Preferences
                    </span>
                    <span className="w-2 h-2 rounded-full bg-sage" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Travel Pace:</span>
                      <span className="font-semibold text-deep-green bg-sage/15 px-2 py-0.5 rounded text-[11px]">
                        Relaxed
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Transport:</span>
                      <span className="font-medium text-text flex items-center gap-1 text-[11px]">
                        <Car className="w-3 h-3 text-text-subtle" />
                        Private Cab
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-border-subtle">
                      <div className="text-[11px] text-text-subtle mb-1.5">Interests:</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] bg-ivory-dark text-text-muted px-2 py-0.5 rounded-md border border-border-subtle">
                          🏛️ Heritage
                        </span>
                        <span className="text-[10px] bg-ivory-dark text-text-muted px-2 py-0.5 rounded-md border border-border-subtle">
                          🏰 Royal Forts
                        </span>
                        <span className="text-[10px] bg-ivory-dark text-text-muted px-2 py-0.5 rounded-md border border-border-subtle">
                          🛍️ Bazaars
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Journey Map Preview */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-border shadow-soft-md space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle">
                        Route Preview
                      </span>
                      <span className="text-[10px] font-mono font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded">
                        0% Backtracking
                      </span>
                    </div>

                    {/* Stylized Visual Route Graphic */}
                    <div className="bg-ivory-dark rounded-xl p-3 border border-border-subtle space-y-2 my-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-text">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-deep-green" /> Amber Fort
                        </span>
                        <span className="text-text-subtle">➔</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-terracotta" /> City Palace
                        </span>
                      </div>

                      {/* Animated connecting line */}
                      <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                        <div className="bg-deep-green h-full w-3/4 rounded-full" />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-subtle">
                        <span>12.4 km transit</span>
                        <span>38 mins travel</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={startPlanningLink}
                    className="text-[11px] font-semibold text-deep-green hover:underline flex items-center justify-end gap-1 pt-1"
                  >
                    <span>View Map Interface</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW THE JOURNEY WORKS SECTION — 8-STEP WORKFLOW
          ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3.5 py-1 rounded-full border border-terracotta/20">
            Intelligent Travel Planning
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text">
            How the Journey Works
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            From initial curiosity to real-time road adaptation, discover how Journeo transforms unstructured travel ideas into seamless, memorable journeys.
          </p>
        </div>

        {/* 8-Step Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-border shadow-soft-sm hover:shadow-card-hover hover:border-sage/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-deep-green bg-sage/15 px-2.5 py-1 rounded-lg">
                      {step.number}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-ivory-dark group-hover:bg-deep-green group-hover:text-white text-deep-green flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-text leading-snug group-hover:text-deep-green transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-subtle font-medium">
                  <span>Step {idx + 1} of 8</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA after Workflow */}
        <div className="mt-16 text-center">
          <Link
            to={startPlanningLink}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white font-semibold text-xs tracking-wide shadow-soft-md hover:shadow-soft-lg transition-all"
          >
            <span>Begin Step 1: Set Your Preferences</span>
            <ArrowRight className="w-4 h-4 text-sage-light" />
          </Link>
        </div>
      </section>
    </div>
  );
};
