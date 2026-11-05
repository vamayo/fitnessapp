import React, { useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import confetti from 'canvas-confetti';
import { Award, Flame, X, Trophy } from 'lucide-react';

export const PRCelebrationModal: React.FC = () => {
  const { lastCelebratedPR, clearPRCelebration, settings } = useWorkout();

  useEffect(() => {
    if (lastCelebratedPR && lastCelebratedPR.length > 0) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4FF00', '#22D3EE', '#F59E0B', '#FFFFFF'],
        });
      } catch {}
    }
  }, [lastCelebratedPR]);

  if (!lastCelebratedPR || lastCelebratedPR.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0C121E] border border-[#D4FF00]/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#D4FF00]/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={clearPRCelebration}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#D4FF00]/15 border border-[#D4FF00]/40 flex items-center justify-center mx-auto mb-4 text-[#D4FF00]">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-[11px] font-mono uppercase tracking-widest text-[#D4FF00] font-bold mb-1">
          Milestone Achieved
        </div>
        <h2 className="text-2xl font-black text-white font-display mb-2">
          New Personal Record!
        </h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          Progressive overload confirmed. You broke your previous estimated 1RM ceiling.
        </p>

        {/* PR Cards */}
        <div className="space-y-2.5 mb-6 text-left">
          {lastCelebratedPR.map((pr, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white">{pr.exerciseName}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Logged: {pr.weight} {settings.weightUnit} × {pr.reps} reps
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-[#D4FF00] tabular-nums">
                  {pr.estimated1RM} {settings.weightUnit}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Est. 1RM</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={clearPRCelebration}
          className="w-full py-3 rounded-xl bg-[#D4FF00] hover:bg-[#bfe600] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#D4FF00]/20"
        >
          Keep Crushing It
        </button>
      </div>
    </div>
  );
};
