import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleGroup } from '../types';
import { MUSCLE_SPECS, calculate1RM } from '../utils/calculations';
import { BarChart3, TrendingUp, Calendar, Download, Upload, Check, Award, Shield } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { workoutHistory, muscleRecovery, settings, exportDataJson, importDataJson } = useWorkout();
  const [selectedLiftForPR, setSelectedLiftForPR] = useState<string>('barbell_bench_press');
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Overall Statistics
  const totalWorkouts = workoutHistory.length;
  const totalTonnageAllTime = workoutHistory.reduce((acc, w) => acc + (w.totalTonnage || 0), 0);
  const totalPRsLogged = workoutHistory.reduce((acc, w) => acc + (w.newPRs?.length || 0), 0);

  // Strength Progression history for selected lift
  const liftHistory: Array<{ date: string; weight: number; reps: number; est1RM: number }> = [];

  workoutHistory
    .slice()
    .reverse()
    .forEach((w) => {
      const match = w.exercises.find((e) => e.exerciseId === selectedLiftForPR);
      if (match) {
        let best1RM = 0;
        let bestSet = { weight: 0, reps: 0 };
        match.sets.forEach((s) => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            const est = calculate1RM(s.weight, s.reps);
            if (est > best1RM) {
              best1RM = est;
              bestSet = { weight: s.weight, reps: s.reps };
            }
          }
        });
        if (best1RM > 0) {
          liftHistory.push({
            date: new Date(w.endTime || w.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            weight: bestSet.weight,
            reps: bestSet.reps,
            est1RM: best1RM,
          });
        }
      }
    });

  const maxHistorical1RM = liftHistory.reduce((max, h) => (h.est1RM > max ? h.est1RM : max), 0);

  const handleExport = () => {
    const json = exportDataJson();
    navigator.clipboard.writeText(json);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importDataJson(importText);
    if (ok) {
      setShowImportModal(false);
      setImportText('');
    } else {
      alert('Invalid JSON backup file. Please verify syntax.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Completed Sessions</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {totalWorkouts}
          </div>
          <div className="text-xs text-slate-500 mt-1">Logged progressive training cycles</div>
        </div>

        <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
            <span>Cumulative Volume</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-[#D4FF00] tabular-nums">
            {totalTonnageAllTime.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">{settings.weightUnit}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Total weight moved in gym</div>
        </div>

        <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Personal Records</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
            {totalPRsLogged}
          </div>
          <div className="text-xs text-slate-500 mt-1">Strength milestones unlocked</div>
        </div>
      </div>

      {/* Weekly Muscle Volume Balance Breakdown */}
      <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">7-Day Muscle Volume Balance</h3>
            <p className="text-xs text-slate-400">
              Weekly sets per muscle group vs hypertrophy optimal targets (10–20 working sets)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">Target: 10-20 sets</span>
        </div>

        <div className="space-y-3">
          {(Object.keys(muscleRecovery) as MuscleGroup[]).map((m) => {
            const spec = MUSCLE_SPECS[m];
            const data = muscleRecovery[m];
            const maxVolume = 24;
            const pct = Math.min(100, (data.weeklySets / maxVolume) * 100);

            return (
              <div key={m} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 w-36 truncate">{spec.name.split(' (')[0]}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">
                      {data.weeklySets} sets
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        data.weeklySets >= spec.recommendedMinSets && data.weeklySets <= spec.recommendedMaxSets
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : data.weeklySets > spec.recommendedMaxSets
                          ? 'text-rose-400 bg-rose-950/60'
                          : 'text-slate-500 bg-slate-900'
                      }`}
                    >
                      {data.weeklySets >= spec.recommendedMinSets && data.weeklySets <= spec.recommendedMaxSets
                        ? 'Optimal'
                        : data.weeklySets > spec.recommendedMaxSets
                        ? 'High'
                        : 'Low'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden relative">
                  {/* Recommended zone indicator line */}
                  <div
                    className="absolute top-0 bottom-0 bg-slate-700/50"
                    style={{
                      left: `${(spec.recommendedMinSets / maxVolume) * 100}%`,
                      width: `${((spec.recommendedMaxSets - spec.recommendedMinSets) / maxVolume) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full rounded-full transition-all duration-300 relative z-10"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        data.weeklySets >= spec.recommendedMinSets && data.weeklySets <= spec.recommendedMaxSets
                          ? '#A3E635'
                          : data.weeklySets > spec.recommendedMaxSets
                          ? '#F43F5E'
                          : '#0284C7',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1RM Strength Curve Progress */}
      <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Compound Lift 1RM Progression</h3>
            <p className="text-xs text-slate-400">Calculated One-Rep Max trends across historical sessions</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'barbell_bench_press', label: 'Bench Press' },
              { id: 'barbell_deadlift', label: 'Deadlift' },
              { id: 'barbell_back_squat', label: 'Back Squat' },
              { id: 'overhead_press', label: 'Overhead Press' },
            ].map((lift) => (
              <button
                key={lift.id}
                onClick={() => setSelectedLiftForPR(lift.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedLiftForPR === lift.id
                    ? 'bg-[#D4FF00] text-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lift.label}
              </button>
            ))}
          </div>
        </div>

        {liftHistory.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No session data recorded for this exercise yet. Complete a workout to see progression.
          </div>
        ) : (
          <div>
            {/* Visual Bar Progression */}
            <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800">
              {liftHistory.map((h, i) => {
                const barHeight = maxHistorical1RM > 0 ? (h.est1RM / maxHistorical1RM) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#D4FF00] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.est1RM}
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-gradient-to-t from-slate-800 to-[#D4FF00] rounded-t-md transition-all group-hover:brightness-125"
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                      {h.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>All-Time Estimated Peak: <strong className="text-white font-mono">{maxHistorical1RM} {settings.weightUnit}</strong></span>
              <span>Formula: Brzycki & Epley composite</span>
            </div>
          </div>
        )}
      </div>

      {/* Data Backup & Portability */}
      <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Data Portability & Zero-Lockin</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Export full JSON workout history, nutrition logs, and custom settings to your device.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copiedExport ? 'Copied JSON!' : 'Export JSON'}</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {/* Modal: Import JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0C121E] border border-slate-700 rounded-2xl shadow-2xl p-5">
            <h3 className="text-base font-bold text-white font-display mb-2">Import Backup Data</h3>
            <p className="text-xs text-slate-400 mb-4">Paste your ApexLift JSON backup string below.</p>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"version": 1, "workoutHistory": [...]}'
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-[#D4FF00]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4FF00] text-black font-semibold text-xs rounded-lg"
                >
                  Confirm Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
