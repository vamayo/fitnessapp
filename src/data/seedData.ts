import { AppSettings, DailyNutrition, WorkoutSession } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  weightUnit: 'lbs',
  defaultRestSeconds: 90,
  soundAlerts: true,
  nutritionEnabled: true,
  showPRCelebration: true,
};

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  // Workout 1: Push Day completed 28 hours ago (Chest & Shoulders recovering)
  {
    id: 'seed-workout-1',
    name: 'Push Hypertrophy',
    startTime: now - (28 * 60 * 60 * 1000) - (55 * 60 * 1000),
    endTime: now - (28 * 60 * 60 * 1000),
    durationSeconds: 3300,
    notes: 'Hit high intensity on incline dumbbell press. Felt strong chest contraction.',
    completed: true,
    totalTonnage: 14850,
    exercises: [
      {
        id: 'we-1',
        exerciseId: 'barbell_bench_press',
        name: 'Barbell Bench Press',
        primaryMuscle: 'chest',
        secondaryMuscles: ['triceps', 'shoulders'],
        sets: [
          { id: 's-1', setNumber: 1, type: 'warmup', weight: 135, reps: 10, rpe: 6, completed: true },
          { id: 's-2', setNumber: 2, type: 'normal', weight: 185, reps: 8, rpe: 8, completed: true },
          { id: 's-3', setNumber: 3, type: 'normal', weight: 205, reps: 6, rpe: 8.5, completed: true },
          { id: 's-4', setNumber: 4, type: 'normal', weight: 215, reps: 5, rpe: 9, completed: true },
        ],
      },
      {
        id: 'we-2',
        exerciseId: 'incline_dumbbell_press',
        name: 'Incline Dumbbell Press',
        primaryMuscle: 'chest',
        secondaryMuscles: ['shoulders', 'triceps'],
        sets: [
          { id: 's-5', setNumber: 1, type: 'normal', weight: 70, reps: 10, rpe: 8, completed: true },
          { id: 's-6', setNumber: 2, type: 'normal', weight: 75, reps: 8, rpe: 8.5, completed: true },
          { id: 's-7', setNumber: 3, type: 'normal', weight: 80, reps: 7, rpe: 9, completed: true },
        ],
      },
      {
        id: 'we-3',
        exerciseId: 'lateral_raises',
        name: 'Dumbbell Lateral Raise',
        primaryMuscle: 'shoulders',
        secondaryMuscles: ['traps'],
        sets: [
          { id: 's-8', setNumber: 1, type: 'normal', weight: 25, reps: 15, rpe: 8, completed: true },
          { id: 's-9', setNumber: 2, type: 'normal', weight: 25, reps: 14, rpe: 8.5, completed: true },
          { id: 's-10', setNumber: 3, type: 'dropset', weight: 20, reps: 15, rpe: 9.5, completed: true },
        ],
      },
      {
        id: 'we-4',
        exerciseId: 'tricep_rope_pushdown',
        name: 'Tricep Rope Pushdown',
        primaryMuscle: 'triceps',
        secondaryMuscles: [],
        sets: [
          { id: 's-11', setNumber: 1, type: 'normal', weight: 60, reps: 12, rpe: 8, completed: true },
          { id: 's-12', setNumber: 2, type: 'normal', weight: 65, reps: 10, rpe: 8.5, completed: true },
          { id: 's-13', setNumber: 3, type: 'normal', weight: 70, reps: 9, rpe: 9, completed: true },
        ],
      },
    ],
  },
  // Workout 2: Pull Power completed 70 hours ago (Back & Biceps fully fresh now!)
  {
    id: 'seed-workout-2',
    name: 'Pull Power & Density',
    startTime: now - (70 * 60 * 60 * 1000) - (60 * 60 * 1000),
    endTime: now - (70 * 60 * 60 * 1000),
    durationSeconds: 3600,
    notes: 'Conventional deadlifts felt explosive off floor. Grip remained solid.',
    completed: true,
    totalTonnage: 19400,
    exercises: [
      {
        id: 'we-14',
        exerciseId: 'barbell_deadlift',
        name: 'Conventional Deadlift',
        primaryMuscle: 'back',
        secondaryMuscles: ['hamstrings', 'glutes', 'traps', 'forearms'],
        sets: [
          { id: 's-14', setNumber: 1, type: 'warmup', weight: 225, reps: 5, rpe: 6, completed: true },
          { id: 's-15', setNumber: 2, type: 'normal', weight: 315, reps: 5, rpe: 7.5, completed: true },
          { id: 's-16', setNumber: 3, type: 'normal', weight: 345, reps: 4, rpe: 8.5, completed: true },
          { id: 's-17', setNumber: 4, type: 'normal', weight: 365, reps: 3, rpe: 9, completed: true },
        ],
      },
      {
        id: 'we-15',
        exerciseId: 'pull_ups',
        name: 'Pull-Ups / Chin-Ups',
        primaryMuscle: 'back',
        secondaryMuscles: ['biceps', 'forearms'],
        sets: [
          { id: 's-18', setNumber: 1, type: 'normal', weight: 0, reps: 12, rpe: 7.5, completed: true },
          { id: 's-19', setNumber: 2, type: 'normal', weight: 0, reps: 10, rpe: 8, completed: true },
          { id: 's-20', setNumber: 3, type: 'normal', weight: 0, reps: 9, rpe: 8.5, completed: true },
        ],
      },
      {
        id: 'we-16',
        exerciseId: 'barbell_bicep_curl',
        name: 'Barbell Bicep Curl',
        primaryMuscle: 'biceps',
        secondaryMuscles: ['forearms'],
        sets: [
          { id: 's-21', setNumber: 1, type: 'normal', weight: 75, reps: 10, rpe: 8, completed: true },
          { id: 's-22', setNumber: 2, type: 'normal', weight: 85, reps: 8, rpe: 8.5, completed: true },
          { id: 's-23', setNumber: 3, type: 'normal', weight: 90, reps: 6, rpe: 9, completed: true },
        ],
      },
    ],
  },
  // Workout 3: Leg Day completed 110 hours ago
  {
    id: 'seed-workout-3',
    name: 'Leg Day & Posterior Chain',
    startTime: now - (110 * 60 * 60 * 1000) - (65 * 60 * 1000),
    endTime: now - (110 * 60 * 60 * 1000),
    durationSeconds: 3900,
    notes: 'Heavy back squat session. Depth was below parallel on all working sets.',
    completed: true,
    totalTonnage: 23200,
    exercises: [
      {
        id: 'we-24',
        exerciseId: 'barbell_back_squat',
        name: 'Barbell Back Squat',
        primaryMuscle: 'quads',
        secondaryMuscles: ['glutes', 'hamstrings', 'abs'],
        sets: [
          { id: 's-24', setNumber: 1, type: 'warmup', weight: 185, reps: 8, rpe: 6, completed: true },
          { id: 's-25', setNumber: 2, type: 'normal', weight: 245, reps: 6, rpe: 7.5, completed: true },
          { id: 's-26', setNumber: 3, type: 'normal', weight: 275, reps: 5, rpe: 8.5, completed: true },
          { id: 's-27', setNumber: 4, type: 'normal', weight: 295, reps: 4, rpe: 9, completed: true },
        ],
      },
      {
        id: 'we-25',
        exerciseId: 'romanian_deadlift',
        name: 'Romanian Deadlift (RDL)',
        primaryMuscle: 'hamstrings',
        secondaryMuscles: ['glutes', 'back', 'forearms'],
        sets: [
          { id: 's-28', setNumber: 1, type: 'normal', weight: 185, reps: 10, rpe: 7.5, completed: true },
          { id: 's-29', setNumber: 2, type: 'normal', weight: 205, reps: 8, rpe: 8, completed: true },
          { id: 's-30', setNumber: 3, type: 'normal', weight: 225, reps: 8, rpe: 8.5, completed: true },
        ],
      },
    ],
  },
];

export const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const INITIAL_NUTRITION: DailyNutrition = {
  date: getTodayDateKey(),
  targetCalories: 2650,
  targetProtein: 185,
  targetCarbs: 280,
  targetFat: 68,
  waterMl: 2250,
  targetWaterMl: 3500,
  entries: [
    {
      id: 'm-1',
      mealCategory: 'breakfast',
      name: 'Steel Cut Oats, Blueberries & Whey Isolate',
      calories: 520,
      protein: 42,
      carbs: 68,
      fat: 8,
      timestamp: Date.now() - 6 * 60 * 60 * 1000,
    },
    {
      id: 'm-2',
      mealCategory: 'lunch',
      name: 'Grilled Chicken Breast, Jasmine Rice & Steamed Broccoli',
      calories: 680,
      protein: 58,
      carbs: 76,
      fat: 14,
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      id: 'm-3',
      mealCategory: 'snack',
      name: 'Non-Fat Greek Yogurt with Crushed Almonds',
      calories: 280,
      protein: 24,
      carbs: 18,
      fat: 12,
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
    },
  ],
};
