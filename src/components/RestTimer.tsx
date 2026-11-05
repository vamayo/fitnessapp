import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Play, Pause, X, Plus, Minus, Volume2, VolumeX, Timer } from 'lucide-react';
import { formatDuration } from '../utils/calculations';

export const RestTimer: React.FC = () => {
  const {
    restTimer,
    pauseRestTimer,
    resumeRestTimer,
    adjustRestTimer,
    stopRestTimer,
    settings,
    updateSettings,
  } = useWorkout();

  // If no rest timer is active or timer expired, don't show
  if (restTimer.secondsRemaining <= 0 && !restTimer.isRunning) {
    return null;
  }

  const progress =
    restTimer.totalDuration > 0
      ? (restTimer.secondsRemaining / restTimer.totalDuration) * 100
      : 0;

  const toggleSound = () => {
    updateSettings({ soundAlerts: !settings.soundAlerts });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-[#0F172A]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4FF00]">
          <Timer className="w-4 h-4 animate-pulse" />
          <span>Rest Countdown</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title={settings.soundAlerts ? 'Mute sound' : 'Unmute sound'}
          >
            {settings.soundAlerts ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
          <button
            onClick={stopRestTimer}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Dismiss rest timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Circular Ring Timer */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#1E293B"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#D4FF00"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-white tabular-nums">
            {formatDuration(restTimer.secondsRemaining)}
          </div>
        </div>

        {/* Info & Adjustments */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">
            {restTimer.exerciseName ? restTimer.exerciseName : 'Active Rest'}
          </div>
          {restTimer.setNumber > 0 && (
            <div className="text-[11px] text-slate-400">Set {restTimer.setNumber} completed</div>
          )}

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => adjustRestTimer(-15)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors"
              title="Minus 15 seconds"
            >
              -15s
            </button>
            <button
              onClick={() => adjustRestTimer(15)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono transition-colors"
              title="Add 15 seconds"
            >
              +15s
            </button>
            <button
              onClick={() => (restTimer.isRunning ? pauseRestTimer() : resumeRestTimer())}
              className="p-1.5 bg-[#D4FF00] hover:bg-[#bfe600] text-black rounded ml-auto transition-colors"
              title={restTimer.isRunning ? 'Pause' : 'Resume'}
            >
              {restTimer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
