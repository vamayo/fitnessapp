import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { BodyView, MuscleGroup } from '../types';
import { MUSCLE_SPECS, formatTimeAgo } from '../utils/calculations';
import { RotateCw, Info, Zap, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MuscleHeatmapProps {
  onSelectMuscle?: (muscle: MuscleGroup) => void;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ onSelectMuscle }) => {
  const { muscleRecovery, setSelectedMuscleForDrawer, selectedMuscleForDrawer } = useWorkout();
  const [view, setView] = useState<BodyView>('front');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);

  const handleMuscleClick = (muscle: MuscleGroup) => {
    setSelectedMuscleForDrawer(muscle);
    if (onSelectMuscle) onSelectMuscle(muscle);
  };

  // Helper to get heat color for a muscle
  const getMuscleColor = (muscle: MuscleGroup): { fill: string; stroke: string; label: string; glow: string } => {
    const data = muscleRecovery[muscle];
    if (!data) return { fill: '#1E293B', stroke: '#334155', label: 'Fresh', glow: 'none' };

    const pct = data.recoveryPercentage;

    if (data.status === 'overworked') {
      return { fill: '#E11D48', stroke: '#FB7185', label: 'Overworked', glow: 'rgba(225, 29, 72, 0.4)' };
    }
    if (pct < 45) {
      return { fill: '#E11D48', stroke: '#F43F5E', label: 'Fatigued (< 45%)', glow: 'rgba(244, 63, 94, 0.35)' };
    }
    if (pct < 75) {
      return { fill: '#D97706', stroke: '#FBBF24', label: 'Recovering (45-75%)', glow: 'rgba(245, 158, 11, 0.3)' };
    }
    if (pct < 95) {
      return { fill: '#65A30D', stroke: '#A3E635', label: 'Ready (75-95%)', glow: 'rgba(163, 230, 53, 0.25)' };
    }
    // Fully fresh
    return { fill: '#059669', stroke: '#34D399', label: 'Fresh (100%)', glow: 'rgba(52, 211, 153, 0.2)' };
  };

  // Count summary
  const recoveryValues = Object.values(muscleRecovery);
  const freshCount = recoveryValues.filter((m) => m.recoveryPercentage >= 85).length;
  const recoveringCount = recoveryValues.filter((m) => m.recoveryPercentage < 85 && m.recoveryPercentage >= 45).length;
  const fatiguedCount = recoveryValues.filter((m) => m.recoveryPercentage < 45).length;

  const activeHoverData = hoveredMuscle ? muscleRecovery[hoveredMuscle] : selectedMuscleForDrawer ? muscleRecovery[selectedMuscleForDrawer] : null;

  return (
    <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white font-display">Muscle Recovery Heatmap</h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Live Dynamic Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap any anatomical muscle zone to view fatigue logs, optimal training window, and exercise volume.
          </p>
        </div>

        {/* Front / Back Segmented Switch */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setView('front')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              view === 'front'
                ? 'bg-slate-800 text-[#D4FF00] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              view === 'back'
                ? 'bg-slate-800 text-[#D4FF00] shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 truncate">Ready to Train</div>
            <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{freshCount} <span className="text-xs font-normal text-slate-500">muscles</span></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 truncate">Recovering</div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">{recoveringCount} <span className="text-xs font-normal text-slate-500">muscles</span></div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 truncate">Fatigued</div>
            <div className="text-lg font-bold font-mono text-rose-400 tabular-nums">{fatiguedCount} <span className="text-xs font-normal text-slate-500">muscles</span></div>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Anatomical Diagram (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#080D18] to-[#0A1020] rounded-xl border border-slate-800/60 p-4 min-h-[460px]">
          {/* Quick Flip Floating Indicator */}
          <button
            onClick={() => setView((v) => (v === 'front' ? 'back' : 'front'))}
            className="absolute top-3 right-3 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors z-10"
            title="Rotate body view"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>Flip to {view === 'front' ? 'Back' : 'Front'}</span>
          </button>

          {/* Interactive SVG Body Figure */}
          <div className="w-full max-w-[320px] aspect-[1/1.8] flex items-center justify-center">
            {view === 'front' ? (
              <svg viewBox="0 0 240 430" className="w-full h-full drop-shadow-2xl select-none">
                {/* Background Body Silhouette for Context */}
                <g opacity="0.12" fill="#94A3B8">
                  {/* Head & Neck */}
                  <circle cx="120" cy="35" r="22" />
                  <rect x="110" y="55" width="20" height="20" rx="4" />
                  {/* Torso Silhouette */}
                  <path d="M78 75 L162 75 L152 210 L88 210 Z" />
                  {/* Arms */}
                  <path d="M72 80 L46 175 L38 235 L52 235 L62 175 L80 100 Z" />
                  <path d="M168 80 L194 175 L202 235 L188 235 L178 175 L160 100 Z" />
                  {/* Legs */}
                  <path d="M88 215 L80 340 L85 410 L108 410 L114 340 L116 215 Z" />
                  <path d="M124 215 L126 340 L132 410 L155 410 L160 340 L152 215 Z" />
                </g>

                {/* 1. CHEST / PECTORALS (Left & Right) */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('chest')}
                  onMouseEnter={() => setHoveredMuscle('chest')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  <path
                    d="M86 86 C98 86 114 90 118 102 C118 122 104 135 84 132 C78 131 75 116 75 102 C75 92 78 86 86 86 Z"
                    fill={getMuscleColor('chest').fill}
                    stroke={hoveredMuscle === 'chest' ? '#FFFFFF' : getMuscleColor('chest').stroke}
                    strokeWidth={hoveredMuscle === 'chest' ? '2.5' : '1.5'}
                  />
                  <path
                    d="M154 86 C142 86 126 90 122 102 C122 122 136 135 156 132 C162 131 165 116 165 102 C165 92 162 86 154 86 Z"
                    fill={getMuscleColor('chest').fill}
                    stroke={hoveredMuscle === 'chest' ? '#FFFFFF' : getMuscleColor('chest').stroke}
                    strokeWidth={hoveredMuscle === 'chest' ? '2.5' : '1.5'}
                  />
                  <text x="120" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    CHEST
                  </text>
                </g>

                {/* 2. SHOULDERS / ANTERIOR DELTOIDS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] origin-center"
                  onClick={() => handleMuscleClick('shoulders')}
                  onMouseEnter={() => setHoveredMuscle('shoulders')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Delt */}
                  <path
                    d="M74 80 C62 84 55 98 56 112 C57 122 66 124 71 116 C76 108 77 94 77 82 Z"
                    fill={getMuscleColor('shoulders').fill}
                    stroke={hoveredMuscle === 'shoulders' ? '#FFFFFF' : getMuscleColor('shoulders').stroke}
                    strokeWidth={hoveredMuscle === 'shoulders' ? '2.5' : '1.5'}
                  />
                  {/* Right Delt */}
                  <path
                    d="M166 80 C178 84 185 98 184 112 C183 122 174 124 169 116 C164 108 163 94 163 82 Z"
                    fill={getMuscleColor('shoulders').fill}
                    stroke={hoveredMuscle === 'shoulders' ? '#FFFFFF' : getMuscleColor('shoulders').stroke}
                    strokeWidth={hoveredMuscle === 'shoulders' ? '2.5' : '1.5'}
                  />
                </g>

                {/* 3. BICEPS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] origin-center"
                  onClick={() => handleMuscleClick('biceps')}
                  onMouseEnter={() => setHoveredMuscle('biceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Bicep */}
                  <path
                    d="M58 122 C52 130 50 148 54 158 C59 160 67 156 68 144 C70 134 66 124 58 122 Z"
                    fill={getMuscleColor('biceps').fill}
                    stroke={hoveredMuscle === 'biceps' ? '#FFFFFF' : getMuscleColor('biceps').stroke}
                    strokeWidth={hoveredMuscle === 'biceps' ? '2.5' : '1.5'}
                  />
                  {/* Right Bicep */}
                  <path
                    d="M182 122 C188 130 190 148 186 158 C181 160 173 156 172 144 C170 134 174 124 182 122 Z"
                    fill={getMuscleColor('biceps').fill}
                    stroke={hoveredMuscle === 'biceps' ? '#FFFFFF' : getMuscleColor('biceps').stroke}
                    strokeWidth={hoveredMuscle === 'biceps' ? '2.5' : '1.5'}
                  />
                </g>

                {/* 4. FOREARMS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] origin-center"
                  onClick={() => handleMuscleClick('forearms')}
                  onMouseEnter={() => setHoveredMuscle('forearms')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Forearm */}
                  <path
                    d="M52 165 C44 175 40 198 42 215 C45 220 54 218 57 205 C60 190 62 172 56 165 Z"
                    fill={getMuscleColor('forearms').fill}
                    stroke={hoveredMuscle === 'forearms' ? '#FFFFFF' : getMuscleColor('forearms').stroke}
                    strokeWidth={hoveredMuscle === 'forearms' ? '2.5' : '1.5'}
                  />
                  {/* Right Forearm */}
                  <path
                    d="M188 165 C196 175 200 198 198 215 C195 220 186 218 183 205 C180 190 178 172 184 165 Z"
                    fill={getMuscleColor('forearms').fill}
                    stroke={hoveredMuscle === 'forearms' ? '#FFFFFF' : getMuscleColor('forearms').stroke}
                    strokeWidth={hoveredMuscle === 'forearms' ? '2.5' : '1.5'}
                  />
                </g>

                {/* 5. ABS / CORE */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('abs')}
                  onMouseEnter={() => setHoveredMuscle('abs')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* 6-pack rects styled organically */}
                  <path
                    d="M102 140 H138 V158 H102 Z M102 162 H138 V180 H102 Z M104 184 H136 V204 H104 Z"
                    fill={getMuscleColor('abs').fill}
                    stroke={hoveredMuscle === 'abs' ? '#FFFFFF' : getMuscleColor('abs').stroke}
                    strokeWidth={hoveredMuscle === 'abs' ? '2' : '1.5'}
                    rx="3"
                  />
                  {/* Obliques */}
                  <path
                    d="M82 142 C92 144 98 152 98 168 C98 184 94 200 86 204 C80 194 78 162 82 142 Z"
                    fill={getMuscleColor('abs').fill}
                    stroke={getMuscleColor('abs').stroke}
                    strokeWidth="1.2"
                    opacity="0.85"
                  />
                  <path
                    d="M158 142 C148 144 142 152 142 168 C142 184 146 200 154 204 C160 194 162 162 158 142 Z"
                    fill={getMuscleColor('abs').fill}
                    stroke={getMuscleColor('abs').stroke}
                    strokeWidth="1.2"
                    opacity="0.85"
                  />
                  <text x="120" y="174" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    CORE
                  </text>
                </g>

                {/* 6. QUADRICEPS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('quads')}
                  onMouseEnter={() => setHoveredMuscle('quads')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Quad */}
                  <path
                    d="M86 218 C78 235 74 275 80 305 C84 315 106 316 112 304 C116 280 115 240 110 218 Z"
                    fill={getMuscleColor('quads').fill}
                    stroke={hoveredMuscle === 'quads' ? '#FFFFFF' : getMuscleColor('quads').stroke}
                    strokeWidth={hoveredMuscle === 'quads' ? '2.5' : '1.5'}
                  />
                  {/* Right Quad */}
                  <path
                    d="M154 218 C162 235 166 275 160 305 C156 315 134 316 128 304 C124 280 125 240 130 218 Z"
                    fill={getMuscleColor('quads').fill}
                    stroke={hoveredMuscle === 'quads' ? '#FFFFFF' : getMuscleColor('quads').stroke}
                    strokeWidth={hoveredMuscle === 'quads' ? '2.5' : '1.5'}
                  />
                  <text x="96" y="265" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    QUADS
                  </text>
                </g>

                {/* 7. CALVES (Front/Tibialis) */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  <path
                    d="M82 328 C78 348 80 376 86 398 C90 400 102 398 104 382 C106 364 104 340 98 328 Z"
                    fill={getMuscleColor('calves').fill}
                    stroke={hoveredMuscle === 'calves' ? '#FFFFFF' : getMuscleColor('calves').stroke}
                    strokeWidth={hoveredMuscle === 'calves' ? '2' : '1.5'}
                  />
                  <path
                    d="M158 328 C162 348 160 376 154 398 C150 400 138 398 136 382 C134 364 136 340 142 328 Z"
                    fill={getMuscleColor('calves').fill}
                    stroke={hoveredMuscle === 'calves' ? '#FFFFFF' : getMuscleColor('calves').stroke}
                    strokeWidth={hoveredMuscle === 'calves' ? '2' : '1.5'}
                  />
                </g>
              </svg>
            ) : (
              /* POSTERIOR / BACK VIEW */
              <svg viewBox="0 0 240 430" className="w-full h-full drop-shadow-2xl select-none">
                {/* Silhouette for Back */}
                <g opacity="0.12" fill="#94A3B8">
                  <circle cx="120" cy="35" r="22" />
                  <rect x="110" y="55" width="20" height="20" rx="4" />
                  <path d="M78 75 L162 75 L152 210 L88 210 Z" />
                  <path d="M72 80 L46 175 L38 235 L52 235 L62 175 L80 100 Z" />
                  <path d="M168 80 L194 175 L202 235 L188 235 L178 175 L160 100 Z" />
                  <path d="M88 215 L80 340 L85 410 L108 410 L114 340 L116 215 Z" />
                  <path d="M124 215 L126 340 L132 410 L155 410 L160 340 L152 215 Z" />
                </g>

                {/* 1. TRAPS & NECK */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('traps')}
                  onMouseEnter={() => setHoveredMuscle('traps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  <path
                    d="M102 58 L138 58 L152 82 L120 115 L88 82 Z"
                    fill={getMuscleColor('traps').fill}
                    stroke={hoveredMuscle === 'traps' ? '#FFFFFF' : getMuscleColor('traps').stroke}
                    strokeWidth={hoveredMuscle === 'traps' ? '2.5' : '1.5'}
                  />
                  <text x="120" y="82" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    TRAPS
                  </text>
                </g>

                {/* 2. UPPER & LAT BACK */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('back')}
                  onMouseEnter={() => setHoveredMuscle('back')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Lat Wing */}
                  <path
                    d="M84 94 C72 108 68 135 74 165 C88 168 108 160 116 142 C116 116 100 102 84 94 Z"
                    fill={getMuscleColor('back').fill}
                    stroke={hoveredMuscle === 'back' ? '#FFFFFF' : getMuscleColor('back').stroke}
                    strokeWidth={hoveredMuscle === 'back' ? '2.5' : '1.5'}
                  />
                  {/* Right Lat Wing */}
                  <path
                    d="M156 94 C168 108 172 135 166 165 C152 168 132 160 124 142 C124 116 140 102 156 94 Z"
                    fill={getMuscleColor('back').fill}
                    stroke={hoveredMuscle === 'back' ? '#FFFFFF' : getMuscleColor('back').stroke}
                    strokeWidth={hoveredMuscle === 'back' ? '2.5' : '1.5'}
                  />
                  {/* Lower Erector Spinae */}
                  <path
                    d="M106 150 H134 V202 H106 Z"
                    fill={getMuscleColor('back').fill}
                    stroke={getMuscleColor('back').stroke}
                    strokeWidth="1.2"
                    opacity="0.9"
                    rx="2"
                  />
                  <text x="120" y="132" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    LATS / BACK
                  </text>
                </g>

                {/* 3. TRICEPS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.03] origin-center"
                  onClick={() => handleMuscleClick('triceps')}
                  onMouseEnter={() => setHoveredMuscle('triceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Tricep */}
                  <path
                    d="M66 108 C58 114 54 135 56 154 C62 156 68 152 70 138 C72 126 70 114 66 108 Z"
                    fill={getMuscleColor('triceps').fill}
                    stroke={hoveredMuscle === 'triceps' ? '#FFFFFF' : getMuscleColor('triceps').stroke}
                    strokeWidth={hoveredMuscle === 'triceps' ? '2.5' : '1.5'}
                  />
                  {/* Right Tricep */}
                  <path
                    d="M174 108 C182 114 186 135 184 154 C178 156 172 152 170 138 C168 126 170 114 174 108 Z"
                    fill={getMuscleColor('triceps').fill}
                    stroke={hoveredMuscle === 'triceps' ? '#FFFFFF' : getMuscleColor('triceps').stroke}
                    strokeWidth={hoveredMuscle === 'triceps' ? '2.5' : '1.5'}
                  />
                </g>

                {/* 4. GLUTES */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('glutes')}
                  onMouseEnter={() => setHoveredMuscle('glutes')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Glute */}
                  <path
                    d="M86 206 C74 212 76 242 84 254 C94 262 115 258 118 244 C120 226 108 208 86 206 Z"
                    fill={getMuscleColor('glutes').fill}
                    stroke={hoveredMuscle === 'glutes' ? '#FFFFFF' : getMuscleColor('glutes').stroke}
                    strokeWidth={hoveredMuscle === 'glutes' ? '2.5' : '1.5'}
                  />
                  {/* Right Glute */}
                  <path
                    d="M154 206 C166 212 164 242 156 254 C146 262 125 258 122 244 C120 226 132 208 154 206 Z"
                    fill={getMuscleColor('glutes').fill}
                    stroke={hoveredMuscle === 'glutes' ? '#FFFFFF' : getMuscleColor('glutes').stroke}
                    strokeWidth={hoveredMuscle === 'glutes' ? '2.5' : '1.5'}
                  />
                  <text x="120" y="235" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    GLUTES
                  </text>
                </g>

                {/* 5. HAMSTRINGS */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('hamstrings')}
                  onMouseEnter={() => setHoveredMuscle('hamstrings')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Hamstring */}
                  <path
                    d="M86 258 C80 274 80 298 84 314 C90 320 106 318 110 306 C114 290 114 270 112 258 Z"
                    fill={getMuscleColor('hamstrings').fill}
                    stroke={hoveredMuscle === 'hamstrings' ? '#FFFFFF' : getMuscleColor('hamstrings').stroke}
                    strokeWidth={hoveredMuscle === 'hamstrings' ? '2.5' : '1.5'}
                  />
                  {/* Right Hamstring */}
                  <path
                    d="M154 258 C160 274 160 298 156 314 C150 320 134 318 130 306 C126 290 126 270 128 258 Z"
                    fill={getMuscleColor('hamstrings').fill}
                    stroke={hoveredMuscle === 'hamstrings' ? '#FFFFFF' : getMuscleColor('hamstrings').stroke}
                    strokeWidth={hoveredMuscle === 'hamstrings' ? '2.5' : '1.5'}
                  />
                  <text x="96" y="290" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    HAMSTRINGS
                  </text>
                </g>

                {/* 6. CALVES (Posterior Gastrocnemius) */}
                <g
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] origin-center"
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                >
                  {/* Left Calf */}
                  <path
                    d="M78 326 C72 344 76 374 84 398 C92 400 104 396 106 376 C108 354 104 336 96 326 Z"
                    fill={getMuscleColor('calves').fill}
                    stroke={hoveredMuscle === 'calves' ? '#FFFFFF' : getMuscleColor('calves').stroke}
                    strokeWidth={hoveredMuscle === 'calves' ? '2' : '1.5'}
                  />
                  {/* Right Calf */}
                  <path
                    d="M162 326 C168 344 164 374 156 398 C148 400 136 396 134 376 C132 354 136 336 144 326 Z"
                    fill={getMuscleColor('calves').fill}
                    stroke={hoveredMuscle === 'calves' ? '#FFFFFF' : getMuscleColor('calves').stroke}
                    strokeWidth={hoveredMuscle === 'calves' ? '2' : '1.5'}
                  />
                  <text x="90" y="360" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" opacity="0.9" pointerEvents="none">
                    CALVES
                  </text>
                </g>
              </svg>
            )}
          </div>

          {/* Quick Legend at bottom of figure */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Fresh (100%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] inline-block" /> Ready (75-95%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Recovering (45-75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Fatigued (&lt;45%)
            </span>
          </div>
        </div>

        {/* Muscle Drill-Down & Readiness Spotlight (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {activeHoverData ? (
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#D4FF00]">
                    {activeHoverData.view === 'front' ? 'Anterior Group' : 'Posterior Group'}
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">{activeHoverData.name}</h3>
                </div>
                <div
                  className="px-2.5 py-1 rounded text-xs font-bold font-mono"
                  style={{
                    backgroundColor: `${getMuscleColor(activeHoverData.muscle).fill}22`,
                    color: getMuscleColor(activeHoverData.muscle).stroke,
                    border: `1px solid ${getMuscleColor(activeHoverData.muscle).stroke}66`,
                  }}
                >
                  {activeHoverData.recoveryPercentage}% Recovered
                </div>
              </div>

              {/* Recovery Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${activeHoverData.recoveryPercentage}%`,
                    backgroundColor: getMuscleColor(activeHoverData.muscle).stroke,
                  }}
                />
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Last Session:</span>
                  <span className="font-medium text-slate-200">{formatTimeAgo(activeHoverData.hoursSinceLastTrained)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">7-Day Volume:</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {activeHoverData.weeklySets} / {activeHoverData.recommendedWeeklySets.min}-{activeHoverData.recommendedWeeklySets.max} sets
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-medium capitalize text-slate-200">{activeHoverData.status}</span>
                </div>
              </div>

              {activeHoverData.lastExercises.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-medium text-slate-400 mb-1.5">Recent Exercises:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeHoverData.lastExercises.map((ex, i) => (
                      <span key={i} className="text-[11px] bg-slate-800/80 border border-slate-700/60 rounded px-2 py-0.5 text-slate-300">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedMuscleForDrawer(activeHoverData.muscle)}
                className="w-full py-2.5 px-4 rounded-lg bg-[#D4FF00] hover:bg-[#bfe600] text-black font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Recovery & Training Details</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                <Info className="w-6 h-6 text-[#D4FF00]" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1 font-display">Select Any Muscle Group</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Click or hover over any muscle zone on the anatomical model to view hours since last session, weekly volume, and recovery timing.
              </p>
            </div>
          )}

          {/* Quick Muscle Grid Shortcut */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>All Muscle Groups</span>
              <span className="text-[11px] text-slate-500 font-mono">12 mapped</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(muscleRecovery) as MuscleGroup[]).map((m) => {
                const spec = MUSCLE_SPECS[m];
                const data = muscleRecovery[m];
                const color = getMuscleColor(m);
                return (
                  <button
                    key={m}
                    onClick={() => handleMuscleClick(m)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/70 text-left transition-colors group"
                  >
                    <span className="text-xs text-slate-300 group-hover:text-white truncate pr-1">
                      {spec.name.split(' (')[0]}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${color.fill}33`,
                        color: color.stroke,
                      }}
                    >
                      {data.recoveryPercentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
