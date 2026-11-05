import { MuscleGroup, MuscleRecoveryData, WorkoutSession } from '../types';

/**
 * Calculates estimated One-Rep Max (1RM) using Epley and Brzycki equations.
 * Epley: Weight * (1 + Reps / 30)
 * Brzycki: Weight * (36 / (37 - Reps))
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 30) reps = 30; // cap for estimation stability

  const epley = weight * (1 + reps / 30);
  const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;

  // Average of both validated formulas, rounded to 1 decimal place
  return Math.round(((epley + brzycki) / 2) * 10) / 10;
}

/**
 * Formats duration from seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(hours: number): string {
  if (hours === Infinity || hours >= 168) return 'Not trained this week';
  if (hours < 1) return 'Just now (< 1h ago)';
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return `${days}d ${remHours > 0 ? `${remHours}h` : ''} ago`;
}

/**
 * Muscle group details and recommended weekly volume (sets per week for hypertrophy)
 */
export const MUSCLE_SPECS: Record<
  MuscleGroup,
  {
    name: string;
    view: 'front' | 'back';
    recoveryHoursNeeded: number;
    recommendedMinSets: number;
    recommendedMaxSets: number;
  }
> = {
  chest: { name: 'Chest (Pectorals)', view: 'front', recoveryHoursNeeded: 48, recommendedMinSets: 12, recommendedMaxSets: 20 },
  shoulders: { name: 'Shoulders (Deltoids)', view: 'front', recoveryHoursNeeded: 40, recommendedMinSets: 14, recommendedMaxSets: 22 },
  biceps: { name: 'Biceps', view: 'front', recoveryHoursNeeded: 36, recommendedMinSets: 10, recommendedMaxSets: 18 },
  forearms: { name: 'Forearms', view: 'front', recoveryHoursNeeded: 36, recommendedMinSets: 8, recommendedMaxSets: 16 },
  abs: { name: 'Core & Abs', view: 'front', recoveryHoursNeeded: 36, recommendedMinSets: 8, recommendedMaxSets: 16 },
  quads: { name: 'Quadriceps', view: 'front', recoveryHoursNeeded: 60, recommendedMinSets: 12, recommendedMaxSets: 20 },
  traps: { name: 'Trapezius & Neck', view: 'back', recoveryHoursNeeded: 44, recommendedMinSets: 8, recommendedMaxSets: 16 },
  back: { name: 'Upper & Lat Back', view: 'back', recoveryHoursNeeded: 52, recommendedMinSets: 14, recommendedMaxSets: 22 },
  triceps: { name: 'Triceps', view: 'back', recoveryHoursNeeded: 38, recommendedMinSets: 10, recommendedMaxSets: 18 },
  glutes: { name: 'Glutes', view: 'back', recoveryHoursNeeded: 56, recommendedMinSets: 10, recommendedMaxSets: 18 },
  hamstrings: { name: 'Hamstrings', view: 'back', recoveryHoursNeeded: 56, recommendedMinSets: 10, recommendedMaxSets: 18 },
  calves: { name: 'Calves', view: 'back', recoveryHoursNeeded: 36, recommendedMinSets: 10, recommendedMaxSets: 18 },
};

/**
 * Computes recovery percentage and training fatigue for all muscle groups
 * based on workout history over the past 7 days.
 */
export function computeMuscleRecovery(
  workouts: WorkoutSession[],
  currentTime = Date.now()
): Record<MuscleGroup, MuscleRecoveryData> {
  const result: Partial<Record<MuscleGroup, MuscleRecoveryData>> = {};

  const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

  // Filter completed workouts in past 7 days
  const recentWorkouts = workouts
    .filter((w) => w.completed && (w.endTime || w.startTime) >= sevenDaysAgo)
    .sort((a, b) => (b.endTime || b.startTime) - (a.endTime || a.startTime));

  const allMuscles: MuscleGroup[] = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
    'abs',
    'traps',
  ];

  for (const muscle of allMuscles) {
    const spec = MUSCLE_SPECS[muscle];
    let latestTrainedTime = 0;
    let totalWeeklySets = 0;
    const lastExercisesSet = new Set<string>();

    for (const workout of recentWorkouts) {
      const workoutTime = workout.endTime || workout.startTime;
      for (const exercise of workout.exercises) {
        const isPrimary = exercise.primaryMuscle === muscle;
        const isSecondary = exercise.secondaryMuscles?.includes(muscle);

        if (isPrimary || isSecondary) {
          const completedSets = exercise.sets.filter((s) => s.completed).length;
          if (completedSets > 0) {
            if (workoutTime > latestTrainedTime) {
              latestTrainedTime = workoutTime;
            }
            // Primary muscle gets 1.0 volume credit; secondary gets 0.5
            totalWeeklySets += isPrimary ? completedSets : completedSets * 0.5;
            lastExercisesSet.add(exercise.name);
          }
        }
      }
    }

    const hoursSinceLastTrained = latestTrainedTime === 0 ? Infinity : (currentTime - latestTrainedTime) / (1000 * 60 * 60);

    // Compute recovery percentage:
    let recoveryPct = 100;
    if (hoursSinceLastTrained < spec.recoveryHoursNeeded) {
      // Linear ramp with volume fatigue penalty
      const baseRecovery = (hoursSinceLastTrained / spec.recoveryHoursNeeded) * 100;
      // High volume (> 8 sets in single session) increases required recovery
      recoveryPct = Math.max(10, Math.min(95, Math.round(baseRecovery)));
    } else {
      recoveryPct = 100;
    }

    let status: MuscleRecoveryData['status'] = 'fresh';
    if (totalWeeklySets > spec.recommendedMaxSets + 4) {
      status = 'overworked';
    } else if (recoveryPct < 50) {
      status = 'fatigued';
    } else if (recoveryPct < 90) {
      status = 'optimal';
    } else {
      status = 'fresh';
    }

    result[muscle] = {
      muscle,
      name: spec.name,
      view: spec.view,
      recoveryPercentage: recoveryPct,
      hoursSinceLastTrained,
      weeklySets: Math.round(totalWeeklySets),
      recommendedWeeklySets: {
        min: spec.recommendedMinSets,
        max: spec.recommendedMaxSets,
      },
      status,
      lastExercises: Array.from(lastExercisesSet).slice(0, 4),
    };
  }

  return result as Record<MuscleGroup, MuscleRecoveryData>;
}
