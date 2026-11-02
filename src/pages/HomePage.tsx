import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  const startPlanningLink = user ? '/plan' : '/login?redirect=/plan';

  // Shortened, streamlined 4-step workflow
  const compactSteps = [
    {
      number: '01',
      title: 'Set Preferences',
      description: 'Choose your interests, travel pace, and preferred transport mode.',
      icon: Sliders
    },
    {
      number: '02',
      title: 'Pick Destinations',
      description: 'Explore curated ASI & UNESCO monuments and choose must-visit sites.',
      icon: Compass
    },
    {
      number: '03',
      title: 'Optimize Route',
      description: 'Our engine eliminates traffic backtracking and respects closing hours.',
      icon: Sparkles
    },
    {
      number: '04',
      title: 'Travel & Adapt',
      description: 'Track progress in Journey Mode with 1-click adaptive delay replanning.',
      icon: Navigation
    }
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#F7F4EA]">
      {/* =========================================================================
          HERO SECTION WITH BACKGROUND SCENIC IMAGE (CENTERED, CLEAN EDITORIAL)
          ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        {/* Background Landscape Photograph with Sophisticated Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Scenic Mountain Lake"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark gradient overlay to guarantee text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-deep-green/15 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8 text-white">
          {/* Introductory Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-ivory text-xs font-semibold tracking-wider uppercase shadow-soft-sm">
            <Compass className="w-3.5 h-3.5 text-sage-light" />
            <span>YOUR PERSONAL TRAVEL COMPANION</span>
          </div>

          {/* Exact Heading */}
          <div className="space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-white leading-[1.12]">
              Make your plans <br />
              <span className="italic font-normal text-sage-light">with Journeo</span>
            </h1>

            {/* Supporting Value Proposition */}
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal max-w-2xl mx-auto">
              Personalized itineraries, intelligent route optimization, and real-time adaptive replanning. Travel at your own pace while Journeo seamlessly coordinates every detail.
            </p>
          </div>

          {/* Single Focused CTA: Start Planning (redirects to signin/login page) */}
          <div className="flex justify-center pt-2">
            <Link
              to={startPlanningLink}
              className="px-9 py-4 rounded-xl bg-deep-green hover:bg-deep-green-dark border border-sage/40 text-white font-semibold text-sm tracking-wide shadow-soft-lg hover:shadow-card-hover transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Start Planning</span>
              <ArrowRight className="w-4 h-4 text-sage-light group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Subtle Feature Indicators */}
          <div className="pt-8 border-t border-white/20 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-white/95">
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
      </section>

      {/* =========================================================================
          SHORTENED "HOW JOURNEO WORKS" SECTION — COMPACT 4-STEP FORMAT
          ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1 rounded-full border border-terracotta/20">
            Intelligent Travel Planning
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            How Journeo Works
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Four simple steps to transform your travel ideas into an optimized, adaptive journey.
          </p>
        </div>

        {/* Shortened, Compact 4-Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {compactSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-border shadow-soft-sm hover:shadow-card-hover hover:border-sage/50 transition-all duration-300 flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-deep-green bg-sage/15 px-2 py-0.5 rounded-md">
                      {step.number}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-ivory-dark group-hover:bg-deep-green group-hover:text-white text-deep-green flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base text-text leading-snug group-hover:text-deep-green transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-subtle">
                  <span>Step {idx + 1} of 4</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
