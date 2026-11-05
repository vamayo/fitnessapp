import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { formatDuration } from '../utils/calculations';
import { Dumbbell, Activity, Utensils, BarChart2, Play, Settings as SettingsIcon, X } from 'lucide-react';

export type ActiveTab = 'workout' | 'heatmap' | 'nutrition' | 'analytics';

interface NavbarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { activeWorkout, activeWorkoutDuration, startWorkout, settings, updateSettings } = useWorkout();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      {/* Desktop Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 w-full bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('workout')}
              className="text-lg font-black tracking-tight text-white font-display hover:text-[#D4FF00] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] inline-block" />
              <span>APEXLIFT</span>
            </button>
          </div>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onTabChange('workout')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                currentTab === 'workout'
                  ? 'text-[#D4FF00] border-[#D4FF00] font-semibold'
                  : 'text-slate-400 border-transparent'
              }`}
            >
              Workout
            </button>
            <button
              onClick={() => onTabChange('heatmap')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                currentTab === 'heatmap'
                  ? 'text-[#D4FF00] border-[#D4FF00] font-semibold'
                  : 'text-slate-400 border-transparent'
              }`}
            >
              Muscle Heatmap
            </button>
            {settings.nutritionEnabled && (
              <button
                onClick={() => onTabChange('nutrition')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                  currentTab === 'nutrition'
                    ? 'text-[#D4FF00] border-[#D4FF00] font-semibold'
                    : 'text-slate-400 border-transparent'
                }`}
              >
                Nutrition
              </button>
            )}
            <button
              onClick={() => onTabChange('analytics')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                currentTab === 'analytics'
                  ? 'text-[#D4FF00] border-[#D4FF00] font-semibold'
                  : 'text-slate-400 border-transparent'
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Settings Icon Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Preferences & Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {activeWorkout ? (
              <button
                onClick={() => onTabChange('workout')}
                className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#D4FF00] hover:bg-[#bfe600] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-md shadow-[#D4FF00]/15"
              >
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>Session Active ({formatDuration(activeWorkoutDuration)})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onTabChange('workout');
                  startWorkout();
                }}
                className="px-4 py-2 text-xs font-semibold text-black bg-[#D4FF00] hover:bg-[#bfe600] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-[#D4FF00]/15"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start Workout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Ergonomic thumb zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080C14]/95 backdrop-blur-md border-t border-slate-800 h-16 px-2 flex items-center justify-around">
        <button
          onClick={() => onTabChange('workout')}
          className={`flex flex-col items-center justify-center w-16 py-1 ${
            currentTab === 'workout' ? 'text-[#D4FF00]' : 'text-slate-400'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Workout</span>
        </button>

        <button
          onClick={() => onTabChange('heatmap')}
          className={`flex flex-col items-center justify-center w-16 py-1 ${
            currentTab === 'heatmap' ? 'text-[#D4FF00]' : 'text-slate-400'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Heatmap</span>
        </button>

        {settings.nutritionEnabled && (
          <button
            onClick={() => onTabChange('nutrition')}
            className={`flex flex-col items-center justify-center w-16 py-1 ${
              currentTab === 'nutrition' ? 'text-[#D4FF00]' : 'text-slate-400'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Nutrition</span>
          </button>
        )}

        <button
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center w-16 py-1 ${
            currentTab === 'analytics' ? 'text-[#D4FF00]' : 'text-slate-400'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Analytics</span>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0C121E] border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">App Preferences</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Weight Unit */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">Weight Units</div>
                  <div className="text-slate-400 text-[11px]">Choose default pound (lbs) or kilogram (kg) display</div>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => updateSettings({ weightUnit: 'lbs' })}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      settings.weightUnit === 'lbs'
                        ? 'bg-[#D4FF00] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    lbs
                  </button>
                  <button
                    onClick={() => updateSettings({ weightUnit: 'kg' })}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      settings.weightUnit === 'kg'
                        ? 'bg-[#D4FF00] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    kg
                  </button>
                </div>
              </div>

              {/* Sound Alerts */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">Timer Audio Feedback</div>
                  <div className="text-slate-400 text-[11px]">Countdown ticks and rest completion chimes</div>
                </div>
                <button
                  onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.soundAlerts ? 'bg-[#D4FF00] justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${settings.soundAlerts ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>

              {/* Nutrition Tracker Module Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div>
                  <div className="font-semibold text-white">Food & Nutrition Tracker</div>
                  <div className="text-slate-400 text-[11px]">Enable or hide the macro & calorie logging module</div>
                </div>
                <button
                  onClick={() => updateSettings({ nutritionEnabled: !settings.nutritionEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.nutritionEnabled ? 'bg-[#D4FF00] justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${settings.nutritionEnabled ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>

              {/* Default Rest Timer Duration */}
              <div className="py-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-semibold text-white">Default Rest Period</div>
                  <span className="font-mono text-[#D4FF00] font-bold">{settings.defaultRestSeconds}s</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[60, 90, 120, 180].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSettings({ defaultRestSeconds: s })}
                      className={`py-1.5 rounded-lg font-mono text-xs ${
                        settings.defaultRestSeconds === s
                          ? 'bg-[#D4FF00] text-black font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
