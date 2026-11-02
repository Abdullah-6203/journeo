import React, { useState } from 'react';
import { DelayScenario, AdaptationStrategy } from '../engine/adaptiveReplanner';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Clock, ArrowRight, X } from 'lucide-react';
import { OptimizedItinerary } from '../engine/itineraryOptimizer';

interface AdaptiveDelayModalProps {
  scenario: DelayScenario | null;
  onClose: () => void;
  onApplyStrategy: (updatedItinerary: OptimizedItinerary) => void;
}

export const AdaptiveDelayModal: React.FC<AdaptiveDelayModalProps> = ({
  scenario,
  onClose,
  onApplyStrategy
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('prioritize_must_visits');

  if (!scenario) return null;

  const currentStrategy = scenario.strategies.find(s => s.id === selectedStrategyId) || scenario.strategies[0];

  return (
    <div className="fixed inset-0 z-[2000] bg-espresso/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] w-full max-w-3xl rounded-2xl border border-sandstone shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon-dark to-maroon text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-sandstone-light">
                Adaptive AI Replanning Engine
              </div>
              <h3 className="font-serif text-lg font-bold">
                Dynamic Delay Detected (+{scenario.delayMinutes} mins at {scenario.delayedStopName})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Threatened Downstream Risk Banner */}
          <div>
            <h4 className="text-xs font-bold text-maroon uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Threatened Downstream Stops ({scenario.threatenedStops.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenario.threatenedStops.map((threat, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-950 flex flex-col justify-between"
                >
                  <div className="font-semibold text-espresso flex items-center justify-between mb-1">
                    <span>{threat.siteName}</span>
                    <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-mono">
                      Proj: {threat.projectedArrival}
                    </span>
                  </div>
                  <p className="text-secondary text-[11px] leading-relaxed">
                    {threat.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Replanning Strategies */}
          <div>
            <h4 className="text-xs font-bold text-espresso uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-dark" /> Select AI Adaptation Strategy
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {scenario.strategies.map(strat => {
                const isSelected = strat.id === selectedStrategyId;
                return (
                  <div
                    key={strat.id}
                    onClick={() => setSelectedStrategyId(strat.id)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-maroon shadow-glow-royal ring-2 ring-maroon/20'
                        : 'bg-white/60 hover:bg-white border-border-soft hover:border-sandstone'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sandstone-light/50 text-espresso">
                          {strat.id === 'prioritize_must_visits' ? 'Recommended' : 'Alternative'}
                        </span>
                        <span className="text-xs font-bold text-maroon">
                          {strat.score}/100
                        </span>
                      </div>
                      <h5 className="font-serif font-bold text-sm text-espresso mb-1">
                        {strat.title}
                      </h5>
                      <p className="text-[11px] text-secondary line-clamp-2">
                        {strat.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border-soft flex items-center justify-between text-[11px] text-espresso font-medium">
                      <span>{strat.stopsCount} Stops</span>
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> +{strat.timeSavedMinutes}m saved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Strategy Deep-Dive */}
            <div className="bg-white rounded-xl p-4 border border-sandstone-light shadow-soft-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-maroon" />
                <h5 className="font-serif font-bold text-sm text-espresso">
                  AI Architecture Rationale
                </h5>
              </div>
              <p className="text-xs text-secondary leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-border-soft italic font-display text-[13px]">
                "{currentStrategy.aiRationale}"
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-secondary">
                <span>
                  Adjusts stops to <strong>{currentStrategy.updatedItinerary.stops.length} monuments</strong> with optimized arrival pacing.
                </span>
                <span className="font-bold text-maroon">
                  Recovery Score: {currentStrategy.score}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F2ECE1] px-6 py-4 border-t border-border-soft flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-espresso transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyStrategy(currentStrategy.updatedItinerary);
              onClose();
            }}
            className="px-5 py-2.5 bg-maroon hover:bg-maroon-light text-white text-xs font-bold rounded-xl shadow-glow-royal transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Apply "{currentStrategy.title.split('(')[0].trim()}" Strategy
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
