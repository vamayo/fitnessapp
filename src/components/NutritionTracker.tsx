import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MealCategory } from '../types';
import { Plus, Trash2, Droplets, Utensils, Edit3, Check, X, Sparkles } from 'lucide-react';

const QUICK_PRESET_MEALS = [
  { name: 'Whey Protein Shake (2 Scoops)', calories: 240, protein: 48, carbs: 4, fat: 3 },
  { name: '3 Whole Eggs + 2 Slices Toast', calories: 380, protein: 24, carbs: 32, fat: 16 },
  { name: 'Grilled Chicken Breast (200g) & Rice', calories: 520, protein: 62, carbs: 55, fat: 6 },
  { name: 'Non-Fat Greek Yogurt (250g) & Berries', calories: 210, protein: 26, carbs: 22, fat: 1 },
  { name: 'Atlantic Salmon Fillet & Sweet Potato', calories: 610, protein: 46, carbs: 48, fat: 24 },
  { name: 'Oatmeal with Peanut Butter & Banana', calories: 450, protein: 14, carbs: 64, fat: 18 },
];

export const NutritionTracker: React.FC = () => {
  const {
    nutrition,
    addNutritionEntry,
    removeNutritionEntry,
    adjustWater,
    updateNutritionGoals,
    settings,
    updateSettings,
  } = useWorkout();

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showEditGoalsModal, setShowEditGoalsModal] = useState(false);

  // New Meal Form State
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState<number>(450);
  const [mealProtein, setMealProtein] = useState<number>(35);
  const [mealCarbs, setMealCarbs] = useState<number>(45);
  const [mealFat, setMealFat] = useState<number>(12);

  // Goals edit form state
  const [goalCalories, setGoalCalories] = useState(nutrition.targetCalories);
  const [goalProtein, setGoalProtein] = useState(nutrition.targetProtein);
  const [goalCarbs, setGoalCarbs] = useState(nutrition.targetCarbs);
  const [goalFat, setGoalFat] = useState(nutrition.targetFat);

  // Compute daily totals
  const totalCalories = nutrition.entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = nutrition.entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = nutrition.entries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = nutrition.entries.reduce((sum, e) => sum + e.fat, 0);

  const remainingCalories = nutrition.targetCalories - totalCalories;

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    addNutritionEntry({
      mealCategory,
      name: mealName.trim(),
      calories: Number(mealCalories) || 0,
      protein: Number(mealProtein) || 0,
      carbs: Number(mealCarbs) || 0,
      fat: Number(mealFat) || 0,
    });

    setMealName('');
    setShowAddMealModal(false);
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESET_MEALS[0]) => {
    setMealName(preset.name);
    setMealCalories(preset.calories);
    setMealProtein(preset.protein);
    setMealCarbs(preset.carbs);
    setMealFat(preset.fat);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateNutritionGoals({
      targetCalories: Number(goalCalories) || 2000,
      targetProtein: Number(goalProtein) || 150,
      targetCarbs: Number(goalCarbs) || 200,
      targetFat: Number(goalFat) || 60,
    });
    setShowEditGoalsModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">Daily Nutrition & Fuel</h2>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                Optional Tracker
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target macronutrients to support muscle recovery, lean tissue growth, and athletic energy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditGoalsModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Goals</span>
            </button>
            <button
              onClick={() => setShowAddMealModal(true)}
              className="px-4 py-2 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-[#D4FF00]/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>

        {/* Macro Progress Rings & Dials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Calories Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span>Calories</span>
              <span className="text-[10px] font-mono text-slate-500">Target: {nutrition.targetCalories}</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalCalories.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                {remainingCalories >= 0 ? `${remainingCalories} kcal left` : `${Math.abs(remainingCalories)} kcal over`}
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalCalories / nutrition.targetCalories) * 100)}%`,
                  backgroundColor: totalCalories > nutrition.targetCalories ? '#F43F5E' : '#D4FF00',
                }}
              />
            </div>
          </div>

          {/* Protein Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span className="text-cyan-400 font-semibold">Protein</span>
              <span className="text-[10px] font-mono text-slate-500">Target: {nutrition.targetProtein}g</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalProtein} <span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-xs text-slate-400">
                {Math.round((totalProtein / nutrition.targetProtein) * 100)}% of daily target
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalProtein / nutrition.targetProtein) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span className="text-amber-400 font-semibold">Carbohydrates</span>
              <span className="text-[10px] font-mono text-slate-500">Target: {nutrition.targetCarbs}g</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalCarbs} <span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-xs text-slate-400">
                {Math.round((totalCarbs / nutrition.targetCarbs) * 100)}% of daily target
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalCarbs / nutrition.targetCarbs) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Fat Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-xs text-slate-400 mb-2">
              <span className="text-rose-400 font-semibold">Healthy Fats</span>
              <span className="text-[10px] font-mono text-slate-500">Target: {nutrition.targetFat}g</span>
            </div>
            <div className="my-1">
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalFat} <span className="text-xs font-normal text-slate-400">g</span>
              </div>
              <div className="text-xs text-slate-400">
                {Math.round((totalFat / nutrition.targetFat) * 100)}% of daily target
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalFat / nutrition.targetFat) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Water Hydration Tracker Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Daily Hydration</span>
                <span className="text-xs font-mono text-cyan-400">
                  {nutrition.waterMl} / {nutrition.targetWaterMl} ml
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Proper hydration preserves muscle fullness and joint lubrication</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustWater(250)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-mono rounded-lg transition-colors"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => adjustWater(500)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-mono rounded-lg transition-colors"
            >
              +500ml Bottle
            </button>
            <button
              onClick={() => adjustWater(-250)}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-slate-300 text-xs rounded-lg transition-colors"
              title="Minus 250ml"
            >
              -250
            </button>
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="bg-[#0C121E] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Logged Meals Today</h3>
            <p className="text-xs text-slate-400">{nutrition.entries.length} items logged for {nutrition.date}</p>
          </div>
          <button
            onClick={() => setShowAddMealModal(true)}
            className="text-xs text-[#D4FF00] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>

        {nutrition.entries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No meals logged today. Tap "Log Meal" or choose a fast preset.
          </div>
        ) : (
          <div className="space-y-2.5">
            {nutrition.entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {entry.mealCategory}
                    </span>
                    <span className="text-sm font-semibold text-white truncate">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="text-white font-bold">{entry.calories} kcal</span>
                    <span>·</span>
                    <span className="text-cyan-400">{entry.protein}g P</span>
                    <span>·</span>
                    <span className="text-amber-400">{entry.carbs}g C</span>
                    <span>·</span>
                    <span className="text-rose-400">{entry.fat}g F</span>
                  </div>
                </div>

                <button
                  onClick={() => removeNutritionEntry(entry.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Meal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0C121E] border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">Log Meal or Snack</h3>
              <button
                onClick={() => setShowAddMealModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick 1-Tap Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PRESET_MEALS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors text-xs"
                  >
                    <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {p.calories} kcal · {p.protein}g protein
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Form */}
            <form onSubmit={handleCreateMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ribeye Steak with Baked Potato"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMealCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                        mealCategory === cat
                          ? 'bg-[#D4FF00] text-black font-semibold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Calories</label>
                  <input
                    type="number"
                    min="0"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-cyan-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-rose-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    value={mealFat}
                    onChange={(e) => setMealFat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#D4FF00]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4FF00] hover:bg-[#bfe600] text-black font-semibold text-xs rounded-lg transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Goals */}
      {showEditGoalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0C121E] border border-slate-700 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Target Daily Nutrition Goals</h3>
              <button
                onClick={() => setShowEditGoalsModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Daily Calories (kcal)</label>
                <input
                  type="number"
                  value={goalCalories}
                  onChange={(e) => setGoalCalories(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-cyan-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={goalProtein}
                    onChange={(e) => setGoalProtein(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={goalCarbs}
                    onChange={(e) => setGoalCarbs(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={goalFat}
                    onChange={(e) => setGoalFat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditGoalsModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4FF00] text-black font-semibold rounded-lg"
                >
                  Update Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
