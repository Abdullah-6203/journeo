import React, { useState, useEffect } from 'react';
import { User, Settings, Sliders, Car, DollarSign, Bookmark, CheckCircle2, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ALL_INTERESTS = [
  'Historical Monuments',
  'Ancient Architecture',
  'Religious Heritage',
  'Museums',
  'Nature and Landscapes',
  'Food and Local Culture',
  'Adventure',
  'Photography',
  'Hidden Gems',
  'Local Experiences'
];

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [budgetPreference, setBudgetPreference] = useState('medium');
  const [transportPreference, setTransportPreference] = useState('cab');
  const [idealExperience, setIdealExperience] = useState('');

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      if (user.preferences) {
        try {
          const interests = typeof user.preferences.interests === 'string'
            ? JSON.parse(user.preferences.interests)
            : user.preferences.interests;
          setSelectedInterests(interests || []);
          setTravelStyle(user.preferences.travelStyle || 'balanced');
          setBudgetPreference(user.preferences.budgetPreference || 'medium');
          setTransportPreference(user.preferences.transportPreference || 'cab');
          setIdealExperience(user.preferences.idealExperience || '');
        } catch (err) {}
      }
    }
  }, [user]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updatePreferences({
        interests: selectedInterests,
        travelStyle,
        budgetPreference,
        transportPreference,
        idealExperience
      });
      await refreshUser();
      setNotice('Preferences updated successfully!');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-border text-center space-y-4 shadow-soft-sm">
        <h2 className="font-serif text-xl font-bold text-text">Please Sign In</h2>
        <p className="text-xs text-text-muted">
          Log in with <code className="bg-ivory px-1 rounded">demo@journeo.com</code> to access and manage your saved travel preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border p-8 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-deep-green text-white flex items-center justify-center font-serif text-2xl font-bold">
            {user.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-text">{user.name}</h1>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-border hover:bg-terracotta/10 hover:text-terracotta text-xs font-semibold text-text-muted transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {notice && (
        <div className="bg-deep-green text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center shadow-soft-sm">
          {notice}
        </div>
      )}

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-border p-8 shadow-soft-sm space-y-8">
        <div>
          <h2 className="font-serif text-xl font-bold text-text flex items-center gap-2">
            <Sliders className="w-5 h-5 text-terracotta" />
            <span>Saved Travel Preferences</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            These preferences are automatically applied to your itineraries so you don't have to enter them every time.
          </p>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text uppercase tracking-wider">
            Favorite Travel Interests
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {ALL_INTERESTS.map(int => {
              const isSel = selectedInterests.includes(int);
              return (
                <button
                  type="button"
                  key={int}
                  onClick={() => toggleInterest(int)}
                  className={`p-3 rounded-xl text-left border text-xs transition-all ${
                    isSel
                      ? 'bg-sage/20 border-deep-green text-deep-green font-bold'
                      : 'bg-ivory border-border text-text-muted hover:bg-ivory-dark'
                  }`}
                >
                  {isSel ? '✓ ' : ''}{int}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text uppercase tracking-wider">
            Default Travel Style & Pace
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'relaxed', label: 'Relaxed (Unhurried)' },
              { id: 'balanced', label: 'Balanced (Standard)' },
              { id: 'packed', label: 'Packed (Fast-paced)' }
            ].map(s => (
              <button
                type="button"
                key={s.id}
                onClick={() => setTravelStyle(s.id)}
                className={`p-3 rounded-xl text-xs font-semibold border transition-all ${
                  travelStyle === s.id
                    ? 'bg-deep-green text-white border-deep-green'
                    : 'bg-ivory border-border text-text'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transportation & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">
              Preferred Transportation
            </label>
            <select
              value={transportPreference}
              onChange={(e) => setTransportPreference(e.target.value)}
              className="w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
            >
              <option value="cab">Car / AC Cab</option>
              <option value="public">Metro / Public Transport</option>
              <option value="walking">Walking / Heritage Trails</option>
              <option value="bicycle">Bicycle Tours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text uppercase tracking-wider mb-2">
              Budget Tier
            </label>
            <select
              value={budgetPreference}
              onChange={(e) => setBudgetPreference(e.target.value)}
              className="w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
            >
              <option value="budget">Budget-Friendly</option>
              <option value="medium">Standard Cultural</option>
              <option value="luxury">Luxury Heritage</option>
            </select>
          </div>
        </div>

        {/* Ideal Experience Natural Language */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-text uppercase tracking-wider">
            Natural-Language Travel Persona
          </label>
          <textarea
            rows={2}
            value={idealExperience}
            onChange={(e) => setIdealExperience(e.target.value)}
            placeholder="e.g. I value quiet morning light, authentic artisan quarters, and verified historical narratives."
            className="w-full bg-ivory border border-border rounded-xl p-3 text-xs text-text focus:outline-none focus:border-deep-green"
          />
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-soft-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
