import React, { useState } from 'react';
import { HeritageSite } from '../data/heritageSites';
import { Volume2, VolumeX, ShieldCheck, Ticket, Clock, BookOpen, Sparkles } from 'lucide-react';

interface HeritageAudioCompanionProps {
  site: HeritageSite;
}

export const HeritageAudioCompanion: React.FC<HeritageAudioCompanionProps> = ({ site }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const narrative = `Welcome to ${site.name}. Located in ${site.city}, this royal heritage landmark was constructed during the ${site.period}. Its architectural style features ${site.architecturalStyle}. ${site.description} Verified by ${site.verification.verifiedBy}.`;
      const utterance = new SpeechSynthesisUtterance(narrative);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-border-soft shadow-soft-md space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-maroon font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span>AI Royal Heritage Companion</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-espresso leading-tight">
            {site.name}
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            {site.city} • {site.period}
          </p>
        </div>

        {/* Audio Guide Play Button */}
        <button
          onClick={toggleSpeech}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
            isPlaying
              ? 'bg-maroon text-white animate-pulse'
              : 'bg-sandstone-light/60 hover:bg-sandstone-light text-espresso'
          }`}
          title={isPlaying ? 'Pause AI voice guide' : 'Listen to AI historical guide'}
        >
          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-maroon" />}
          <span>{isPlaying ? 'Speaking...' : 'Listen Guide'}</span>
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-espresso/90 leading-relaxed font-sans">
        {site.description}
      </p>

      {/* Metadata Badges Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border-soft">
        <div className="bg-sandstone-light/20 p-2 rounded-lg border border-sandstone-light/40 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gold-dark flex-shrink-0" />
          <div>
            <div className="text-secondary text-[10px]">Visiting Hours</div>
            <div className="font-semibold text-espresso">{site.openingHours}</div>
          </div>
        </div>

        <div className="bg-sandstone-light/20 p-2 rounded-lg border border-sandstone-light/40 flex items-center gap-2">
          <Ticket className="w-3.5 h-3.5 text-maroon flex-shrink-0" />
          <div>
            <div className="text-secondary text-[10px]">Entry Ticket (ASI)</div>
            <div className="font-semibold text-espresso">
              {site.ticketPriceINR === 0 ? 'Free Entry' : `₹${site.ticketPriceINR} / person`}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Citation Banner */}
      <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-sandstone-light/70 flex items-start gap-2 text-[11px]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-espresso block">Verified Data Source:</span>
          <span className="text-secondary">{site.verification.verifiedBy}</span>
          {site.verification.citationNumber && (
            <span className="block text-[10px] text-maroon font-mono mt-0.5">
              Citation: {site.verification.citationNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
