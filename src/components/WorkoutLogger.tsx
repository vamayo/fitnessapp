import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { ROUTINE_TEMPLATES } from '../data/exerciseLibrary';
import { formatDuration } from '../utils/calculations';
import {
  Play,
  Check,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  Search,
  X,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MuscleGroup, SetType } from '../types';

export const WorkoutLogger: React.FC = () => {
  const {
    activeWorkout,
    activeWorkoutDuration,
    startWorkout,
    cancelWorkout,
    finishWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    toggleSetComplete,
    updateActiveWorkoutNotes,
    workoutHistory,
    exerciseLibrary,
    settings,
  } = useWorkout();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState<string>('all');
  const [expandedPastWorkoutId, setExpandedPastWorkoutId] = useState<string | null>(null);

  // Filter exercise catalog
  const filteredExercises = exerciseLibrary.filter((ex) => {
    const matchesQuery = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle =
      exerciseMuscleFilter === 'all' ||
      ex.primaryMuscle === exerciseMuscleFilter ||
      ex.secondaryMuscles.includes(exerciseMuscleFilter as MuscleGroup);
    return matchesQuery && matchesMuscle;
  });

  // Calculate live tonnage in active workout
  const liveTonnage = activeWorkout
    ? activeWorkout.exercises.reduce((acc, ex) => {
        return (
          acc +
          ex.sets.reduce((sAcc, s) => {
            return sAcc + (s.completed ? s.weight * s.reps : 0);
          }, 0)
        );
      }, 0)
    : 0;

  // Active workout view
  if (activeWorkout) {
    return (
      <div className="space-y-6">
        {/* Sticky-Aware Active Session HUD Bar */}
        <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl sticky top-20 z-20 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#D4FF00]">
                  Session In Progress
                </span>
              </div>
              <input
                type="text"
                value={activeWorkout.name}
                onChange={(e) => {
                  activeWorkout.name = e.target.value;
                }}
                className="text-xl sm:text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-[#D4FF00] focus:outline-none transition-colors font-display"
              />
            </div>

            {/* Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-bold text-white tabular-nums">
                    {formatDuration(activeWorkoutDuration)}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="w-4 h-4 text-[#D4FF00]" />
                  <span className="font-mono font-bold text-white tabular-nums">
                    {liveTonnage.toLocaleString()} {settings.weightUnit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={cancelWorkout}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => finishWorkout()}
                  className="px-4 py-2 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-semibold text-xs tracking-wide rounded-lg shadow-md shadow-[#D4FF00]/10 flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish Workout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Session Notes Input */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <input
              type="text"
              placeholder="Session notes (e.g. felt strong on top singles, adjusted grip width...)"
              value={activeWorkout.notes || ''}
              onChange={(e) => updateActiveWorkoutNotes(e.target.value)}
              className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Exercises List in Active Workout */}
        {activeWorkout.exercises.length === 0 ? (
          <div className="bg-[#0C121E] border border-dashed border-slate-800 rounded-2xl p-10 text-center">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Exercises Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Build your workout by selecting compound and isolation exercises from the verified movement library.
            </p>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4FF00] text-black font-semibold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeWorkout.exercises.map((workoutExercise) => (
              <div
                key={workoutExercise.id}
                className="bg-[#0C121E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      {workoutExercise.name}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded capitalize">
                      {workoutExercise.primaryMuscle}
                    </span>
                  </div>
                  <button
                    onClick={() => removeExerciseFromWorkout(workoutExercise.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Remove exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                        <th className="pb-2 w-12 text-center">SET</th>
                        <th className="pb-2 w-28">TYPE</th>
                        <th className="pb-2 w-24">PREVIOUS</th>
                        <th className="pb-2 w-28">WEIGHT ({settings.weightUnit})</th>
                        <th className="pb-2 w-24">REPS</th>
                        <th className="pb-2 w-14 text-center">DONE</th>
                        <th className="pb-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {workoutExercise.sets.map((set) => (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-950/20 text-emerald-200' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          {/* Set number */}
                          <td className="py-2.5 text-center font-mono font-bold text-slate-400">
                            {set.setNumber}
                          </td>

                          {/* Set Type Selector */}
                          <td className="py-2.5 pr-2">
                            <select
                              value={set.type}
                              onChange={(e) =>
                                updateSet(workoutExercise.id, set.id, {
                                  type: e.target.value as SetType,
                                })
                              }
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-[#D4FF00]"
                            >
                              <option value="warmup">Warm-up</option>
                              <option value="normal">Working</option>
                              <option value="dropset">Drop Set</option>
                              <option value="failure">To Failure</option>
                            </select>
                          </td>

                          {/* Previous ghost value */}
                          <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                            {set.previousWeight !== undefined && set.previousReps !== undefined
                              ? `${set.previousWeight} × ${set.previousReps}`
                              : '—'}
                          </td>

                          {/* Weight input */}
                          <td className="py-2.5 pr-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                step="2.5"
                                value={set.weight || ''}
                                onChange={(e) =>
                                  updateSet(workoutExercise.id, set.id, {
                                    weight: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-18 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono font-semibold text-white focus:outline-none focus:border-[#D4FF00] tabular-nums"
                              />
                            </div>
                          </td>

                          {/* Reps input */}
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ''}
                              onChange={(e) =>
                                updateSet(workoutExercise.id, set.id, {
                                  reps: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono font-semibold text-white focus:outline-none focus:border-[#D4FF00] tabular-nums"
                            />
                          </td>

                          {/* Complete checkbox button */}
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => toggleSetComplete(workoutExercise.id, set.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-[#D4FF00] text-black shadow-sm shadow-[#D4FF00]/40'
                                  : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                              }`}
                              title={set.completed ? 'Mark incomplete' : 'Complete set & start rest timer'}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => removeSetFromExercise(workoutExercise.id, set.id)}
                              className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                              title="Delete set"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <button
                    onClick={() => addSetToExercise(workoutExercise.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span>Add Set</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Floating Add Exercise Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowAddExerciseModal(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:border-[#D4FF00]"
              >
                <Plus className="w-4 h-4 text-[#D4FF00]" />
                <span>Add Another Exercise to Workout</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal: Add Exercise Catalog */}
        {showAddExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#0C121E] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Add Exercise</h3>
                  <p className="text-xs text-slate-400">Search over 30+ verified strength movements</p>
                </div>
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search & Muscle Filters */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search exercise by name..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'abs'].map(
                    (m) => (
                      <button
                        key={m}
                        onClick={() => setExerciseMuscleFilter(m)}
                        className={`px-3 py-1 rounded-md capitalize font-medium whitespace-nowrap text-xs transition-colors ${
                          exerciseMuscleFilter === m
                            ? 'bg-[#D4FF00] text-black font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Exercise List */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/40">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">No exercises found.</div>
                ) : (
                  filteredExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="pt-2 pb-2 flex items-center justify-between hover:bg-slate-900/60 p-2 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{ex.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {ex.primaryMuscle} · {ex.category} · {ex.defaultRestSec}s rest
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addExerciseToWorkout(ex.id);
                          setShowAddExerciseModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#D4FF00] text-black font-semibold text-xs hover:bg-[#bfe600] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Zero-state or Routine Selector view (when NO active workout)
  return (
    <div className="space-y-8">
      {/* Hero Banner: Start Workout */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0E1526] to-[#0A101D] border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-xl relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#D4FF00]">
              Strength & Progressive Overload
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
            Ready to Train Today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Select a targeted routine template below or launch a freeform workout session with live rest timers and set-by-set ghost targets.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => startWorkout(undefined, 'Custom Strength Session')}
              className="px-5 py-3 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#D4FF00]/15 flex items-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Empty Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Routine Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Preset Training Routines</h3>
            <p className="text-xs text-slate-400">Scientifically split hypertrophy & strength routines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROUTINE_TEMPLATES.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#0C121E] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#D4FF00] bg-[#D4FF00]/10 border border-[#D4FF00]/20 px-2 py-0.5 rounded">
                    ~{routine.estimatedMinutes} Mins
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {routine.exerciseIds.length} movements
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#D4FF00] transition-colors font-display mb-1.5">
                  {routine.name}
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">
                  {routine.description}
                </p>

                {/* Target muscle tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {routine.targetMuscles.map((tm) => (
                    <span
                      key={tm}
                      className="text-[10px] bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-300 capitalize font-mono"
                    >
                      {tm}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => startWorkout(routine.id)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-[#D4FF00] text-slate-200 hover:text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Routine</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Workout History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Recent Completed Workouts</h3>
            <p className="text-xs text-slate-400">Past performance logs and tonnage history</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{workoutHistory.length} total logged</span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="bg-[#0C121E] border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
            No completed workouts recorded yet. Start your first session above!
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.map((w) => {
              const isExpanded = expandedPastWorkoutId === w.id;
              const dateStr = new Date(w.endTime || w.startTime).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={w.id}
                  className="bg-[#0C121E] border border-slate-800/80 rounded-xl overflow-hidden transition-colors"
                >
                  <div
                    onClick={() => setExpandedPastWorkoutId(isExpanded ? null : w.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-display">{w.name}</span>
                        {w.newPRs && w.newPRs.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded">
                            <Award className="w-3 h-3" /> {w.newPRs.length} PR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {dateStr} · {formatDuration(w.durationSeconds)} · {w.exercises.length} exercises
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#D4FF00] tabular-nums">
                          {w.totalTonnage.toLocaleString()} {settings.weightUnit}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Total Volume</div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Workout Breakdown */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
                      {w.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                          "{w.notes}"
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {w.exercises.map((ex, i) => (
                          <div key={i} className="bg-slate-900/70 border border-slate-800/60 rounded-lg p-3 text-xs">
                            <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between">
                              <span>{ex.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 capitalize">
                                {ex.primaryMuscle}
                              </span>
                            </div>
                            <div className="space-y-0.5 font-mono text-[11px] text-slate-400">
                              {ex.sets.map((s, sIdx) => (
                                <div key={sIdx} className="flex justify-between">
                                  <span>
                                    Set {s.setNumber} ({s.type})
                                  </span>
                                  <span className="text-slate-300">
                                    {s.weight} {settings.weightUnit} × {s.reps} reps
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
