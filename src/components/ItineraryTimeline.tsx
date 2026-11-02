import React from 'react';
import { OptimizedItinerary, ItineraryStop } from '../engine/itineraryOptimizer';
import { HeritageSite } from '../data/heritageSites';
import { Clock, Navigation, CheckCircle2, AlertTriangle, ShieldCheck, Box } from 'lucide-react';

interface ItineraryTimelineProps {
  itinerary: OptimizedItinerary;
  selectedSite: HeritageSite;
  onSelectSite: (site: HeritageSite) => void;
  onSimulateDelay: (stop: ItineraryStop) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itinerary,
  selectedSite,
  onSelectSite,
  onSimulateDelay
}) => {
  return (
    <div className="space-y-4">
      {/* Route Overview Stat Bar */}
      <div className="bg-sandstone-light/30 border border-sandstone-light/80 p-3.5 rounded-xl flex items-center justify-between text-xs text-espresso">
        <div>
          <span className="text-secondary font-medium block">Starting Location</span>
          <span className="font-semibold text-espresso">{itinerary.startingPoint.address.split(',')[0]}</span>
        </div>
        <div className="text-right">
          <span className="text-secondary font-medium block">Optimization Score</span>
          <span className="font-bold text-maroon text-sm">{itinerary.optimizationScore}/100</span>
        </div>
      </div>

      {/* Stops List */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sandstone">
        {itinerary.stops.map((stop, idx) => {
          const isSelected = stop.site.id === selectedSite.id;

          return (
            <div key={stop.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-serif font-bold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-maroon text-white ring-2 ring-maroon/40 scale-110'
                    : stop.isMustVisit
                    ? 'bg-gold text-white'
                    : 'bg-espresso text-white'
                }`}
              >
                {stop.stopOrder}
              </div>

              {/* Transit Notice */}
              <div className="mb-2 text-[11px] text-secondary flex items-center gap-1.5 font-medium pl-2">
                <Navigation className="w-3 h-3 text-gold-dark" />
                <span>{stop.transitInstruction}</span>
              </div>

              {/* Stop Card */}
              <div
                onClick={() => onSelectSite(stop.site)}
                className={`cursor-pointer rounded-xl p-4 transition-all border ${
                  isSelected
                    ? 'bg-white border-maroon shadow-glow-royal'
                    : 'bg-white/80 hover:bg-white border-border-soft hover:border-sandstone shadow-soft-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-maroon bg-maroon/10 px-2 py-0.5 rounded">
                        Stop {stop.stopOrder}
                      </span>
                      {stop.isMustVisit && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-700" /> Must Visit
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> ASI / UNESCO
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-espresso leading-snug">
                      {stop.site.name}
                    </h4>
                    <p className="text-xs text-secondary mt-0.5">
                      {stop.site.architecturalStyle} • {stop.site.period.split('(')[0]}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={stop.site.image}
                    alt={stop.site.name}
                    className="w-16 h-16 rounded-lg object-cover border border-sandstone-light shadow-soft-sm flex-shrink-0"
                  />
                </div>

                {/* Dwell Time & Schedule */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-border-soft mt-3 text-espresso/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-espresso">
                      <Clock className="w-3.5 h-3.5 text-maroon" />
                      {stop.arrivalTime} - {stop.departureTime}
                    </span>
                    <span className="text-secondary text-[11px]">
                      ({stop.durationMinutes} mins dwell)
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSite(stop.site)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-maroon bg-maroon/10 hover:bg-maroon hover:text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      <Box className="w-3 h-3" /> 3D View
                    </button>
                    <button
                      onClick={() => onSimulateDelay(stop)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors flex items-center gap-1"
                      title="Simulate 45-min delay here"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-700" /> Simulate Delay
                    </button>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  {stop.site.highlights.map(h => (
                    <span key={h} className="text-[10px] bg-sandstone-light/30 text-espresso px-2 py-0.5 rounded border border-sandstone-light/60">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
