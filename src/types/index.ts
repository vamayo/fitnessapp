export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'traps';

export type BodyView = 'front' | 'back';

export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  totalTonnage: number; // weight * reps
  newPRs?: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    estimated1RM: number;
  }>;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  defaultRestSec: number;
  instructions?: string;
}

export interface WorkoutRoutineTemplate {
  id: string;
  name: string;
  description: string;
  targetMuscles: MuscleGroup[];
  estimatedMinutes: number;
  exerciseIds: string[];
}

export interface MuscleRecoveryData {
  muscle: MuscleGroup;
  name: string;
  view: BodyView;
  recoveryPercentage: number; // 0 (completely exhausted) to 100 (fully fresh)
  hoursSinceLastTrained: number;
  weeklySets: number;
  recommendedWeeklySets: { min: number; max: number };
  status: 'fresh' | 'optimal' | 'fatigued' | 'overworked';
  lastExercises: string[];
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionEntry {
  id: string;
  mealCategory: MealCategory;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface DailyNutrition {
  date: string; // YYYY-MM-DD
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterMl: number;
  targetWaterMl: number;
  entries: NutritionEntry[];
}

export interface AppSettings {
  weightUnit: 'lbs' | 'kg';
  defaultRestSeconds: number;
  soundAlerts: boolean;
  nutritionEnabled: boolean;
  showPRCelebration: boolean;
}
