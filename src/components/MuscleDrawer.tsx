import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MUSCLE_SPECS, formatTimeAgo } from '../utils/calculations';
import { X, Dumbbell, ShieldAlert, CheckCircle, Clock, Plus, BarChart3 } from 'lucide-react';

export const MuscleDrawer: React.FC = () => {
  const {
    selectedMuscleForDrawer,
    setSelectedMuscleForDrawer,
    muscleRecovery,
    exerciseLibrary,
    addExerciseToWorkout,
  } = useWorkout();

  if (!selectedMuscleForDrawer) return null;

  const muscle = selectedMuscleForDrawer;
  const spec = MUSCLE_SPECS[muscle];
  const data = muscleRecovery[muscle];

  if (!data) return null;

  const exercisesForThisMuscle = exerciseLibrary.filter(
    (e) => e.primaryMuscle === muscle || e.secondaryMuscles.includes(muscle)
  );

  const hoursRemainingForFullRecovery = Math.max(0, Math.round(spec.recoveryHoursNeeded - (data.hoursSinceLastTrained === Infinity ? spec.recoveryHoursNeeded : data.hoursSinceLastTrained)));

  const getReadinessRecommendation = () => {
    if (data.status === 'overworked') {
      return {
        title: 'Overworked / Deload Advised',
        desc: `You have accumulated ${data.weeklySets} sets this week on this muscle group, exceeding maximum recoverable volume. Consider active recovery or rest.`,
        icon: ShieldAlert,
        colorClass: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
      };
    }
    if (data.recoveryPercentage >= 85) {
      return {
        title: 'Fully Primed & Recovered',
        desc: 'High neuromuscular readiness. Optimal window for heavy progressive overload and high-intensity sets.',
        icon: CheckCircle,
        colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
      };
    }
    if (data.recoveryPercentage >= 50) {
      return {
        title: 'Moderate Recovery in Progress',
        desc: `Muscle fibers are currently synthesizing protein. Approx. ${hoursRemainingForFullRecovery} hours until 100% recovery. Light volume acceptable.`,
        icon: Clock,
        colorClass: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
      };
    }
    return {
      title: 'Deep Muscular Fatigue',
      desc: `Recently trained (${formatTimeAgo(data.hoursSinceLastTrained)}). Allow at least 24 hours more before heavy compound work to prevent overtraining.`,
      icon: ShieldAlert,
      colorClass: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    };
  };

  const recommendation = getReadinessRecommendation();
  const RecIcon = recommendation.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg h-full bg-[#0C121E] border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#D4FF00]">
              Muscle Group Deep-Dive
            </span>
            <h2 className="text-xl font-bold text-white font-display">{spec.name}</h2>
          </div>
          <button
            onClick={() => setSelectedMuscleForDrawer(null)}
            className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recovery Score & Gauge */}
        <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Readiness Score</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {data.recoveryPercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${data.recoveryPercentage}%`,
                backgroundColor:
                  data.recoveryPercentage >= 85
                    ? '#10B981'
                    : data.recoveryPercentage >= 50
                    ? '#F59E0B'
                    : '#F43F5E',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[11px]">Last Trained</span>
              <span className="font-semibold text-slate-200">{formatTimeAgo(data.hoursSinceLastTrained)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Full Recovery Est.</span>
              <span className="font-semibold text-slate-200">
                {hoursRemainingForFullRecovery === 0 ? 'Ready Now' : `~${hoursRemainingForFullRecovery}h remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Readiness Alert Box */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${recommendation.colorClass}`}>
          <RecIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold mb-0.5">{recommendation.title}</div>
            <p className="text-xs leading-relaxed opacity-90">{recommendation.desc}</p>
          </div>
        </div>

        {/* Weekly Volume Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#D4FF00]" /> Weekly Volume Progression
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {data.weeklySets} sets logged
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Target Range for Hypertrophy:</span>
              <span className="font-mono text-slate-200 font-medium">
                {data.recommendedWeeklySets.min} – {data.recommendedWeeklySets.max} sets/week
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#D4FF00] rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (data.weeklySets / data.recommendedWeeklySets.max) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Exercises that Target this Muscle */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target Exercises ({exercisesForThisMuscle.length})
            </h3>
            <span className="text-[11px] text-slate-500">Tap + to add to workout</span>
          </div>

          <div className="space-y-2 mb-6">
            {exercisesForThisMuscle.map((ex) => {
              const isPrimary = ex.primaryMuscle === muscle;
              return (
                <div
                  key={ex.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{ex.name}</span>
                      {isPrimary ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          Primary
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          Secondary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 capitalize mt-0.5">
                      {ex.category} · {ex.defaultRestSec}s rest
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addExerciseToWorkout(ex.id);
                      setSelectedMuscleForDrawer(null);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-[#D4FF00] text-slate-300 hover:text-black border border-slate-700 hover:border-[#D4FF00] transition-colors shrink-0"
                    title={`Add ${ex.name} to active workout`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 mt-auto">
          <button
            onClick={() => setSelectedMuscleForDrawer(null)}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Deep-Dive
          </button>
        </div>
      </div>
    </div>
  );
};
