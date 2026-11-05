import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppSettings,
  DailyNutrition,
  ExerciseDefinition,
  MuscleGroup,
  MuscleRecoveryData,
  NutritionEntry,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from '../types';
import { EXERCISE_LIBRARY, ROUTINE_TEMPLATES } from '../data/exerciseLibrary';
import { INITIAL_NUTRITION, INITIAL_SETTINGS, INITIAL_WORKOUTS, getTodayDateKey } from '../data/seedData';
import { calculate1RM, computeMuscleRecovery } from '../utils/calculations';
import { soundManager } from '../utils/audio';

interface RestTimerState {
  secondsRemaining: number;
  totalDuration: number;
  isRunning: boolean;
  exerciseName: string;
  setNumber: number;
}

interface WorkoutContextType {
  // Workouts
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  exerciseLibrary: ExerciseDefinition[];
  activeWorkoutDuration: number;
  muscleRecovery: Record<MuscleGroup, MuscleRecoveryData>;

  // Rest Timer
  restTimer: RestTimerState;
  startRestTimer: (seconds?: number, exerciseName?: string, setNumber?: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  adjustRestTimer: (secondsDelta: number) => void;
  stopRestTimer: () => void;

  // Active Workout Actions
  startWorkout: (templateId?: string, customName?: string) => void;
  cancelWorkout: () => void;
  finishWorkout: () => WorkoutSession | null;
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  addSetToExercise: (workoutExerciseId: string) => void;
  removeSetFromExercise: (workoutExerciseId: string, setId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  toggleSetComplete: (workoutExerciseId: string, setId: string) => void;
  updateActiveWorkoutNotes: (notes: string) => void;

  // Nutrition
  nutrition: DailyNutrition;
  addNutritionEntry: (entry: Omit<NutritionEntry, 'id' | 'timestamp'>) => void;
  removeNutritionEntry: (entryId: string) => void;
  adjustWater: (deltaMl: number) => void;
  updateNutritionGoals: (goals: { targetCalories?: number; targetProtein?: number; targetCarbs?: number; targetFat?: number; targetWaterMl?: number }) => void;

  // Settings & Utilities
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  selectedMuscleForDrawer: MuscleGroup | null;
  setSelectedMuscleForDrawer: (muscle: MuscleGroup | null) => void;
  lastCelebratedPR: WorkoutSession['newPRs'] | null;
  clearPRCelebration: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

const STORAGE_WORKOUTS_KEY = 'apexlift_workouts_v1';
const STORAGE_NUTRITION_KEY = 'apexlift_nutrition_v1';
const STORAGE_SETTINGS_KEY = 'apexlift_settings_v1';
const STORAGE_ACTIVE_KEY = 'apexlift_active_workout_v1';

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 2. Workout History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WORKOUTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WORKOUTS;
    } catch {
      return INITIAL_WORKOUTS;
    }
  });

  // 3. Active Workout
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeWorkoutDuration, setActiveWorkoutDuration] = useState<number>(0);

  // 4. Rest Timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    secondsRemaining: 0,
    totalDuration: 0,
    isRunning: false,
    exerciseName: '',
    setNumber: 0,
  });

  // 5. Daily Nutrition
  const [nutrition, setNutrition] = useState<DailyNutrition>(() => {
    try {
      const todayKey = getTodayDateKey();
      const saved = localStorage.getItem(STORAGE_NUTRITION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayKey) {
          return parsed;
        }
      }
      return { ...INITIAL_NUTRITION, date: todayKey };
    } catch {
      return INITIAL_NUTRITION;
    }
  });

  // UI Drawer State & PR celebration
  const [selectedMuscleForDrawer, setSelectedMuscleForDrawer] = useState<MuscleGroup | null>(null);
  const [lastCelebratedPR, setLastCelebratedPR] = useState<WorkoutSession['newPRs'] | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WORKOUTS_KEY, JSON.stringify(workoutHistory));
    } catch {}
  }, [workoutHistory]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_KEY);
      }
    } catch {}
  }, [activeWorkout]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NUTRITION_KEY, JSON.stringify(nutrition));
    } catch {}
  }, [nutrition]);

  // Active workout elapsed duration ticker
  useEffect(() => {
    if (!activeWorkout) {
      setActiveWorkoutDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
      setActiveWorkoutDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer interval loop with audio ticks and completion chime
  useEffect(() => {
    if (!restTimer.isRunning || restTimer.secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.isRunning) return prev;

        if (prev.secondsRemaining <= 1) {
          if (settings.soundAlerts) {
            soundManager.playRestComplete();
          }
          return { ...prev, secondsRemaining: 0, isRunning: false };
        }

        // Tick on last 3 seconds
        if (prev.secondsRemaining <= 4 && settings.soundAlerts) {
          soundManager.playTick();
        }

        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isRunning, restTimer.secondsRemaining, settings.soundAlerts]);

  // Derived: Muscle Recovery status
  const muscleRecovery = useMemo(() => {
    return computeMuscleRecovery(workoutHistory, Date.now());
  }, [workoutHistory]);

  // Rest Timer Controls
  const startRestTimer = useCallback(
    (seconds?: number, exerciseName = '', setNumber = 0) => {
      const duration = seconds ?? settings.defaultRestSeconds;
      setRestTimer({
        secondsRemaining: duration,
        totalDuration: duration,
        isRunning: true,
        exerciseName,
        setNumber,
      });
    },
    [settings.defaultRestSeconds]
  );

  const pauseRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resumeRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isRunning: prev.secondsRemaining > 0 }));
  }, []);

  const adjustRestTimer = useCallback((secondsDelta: number) => {
    setRestTimer((prev) => {
      const newSec = Math.max(0, prev.secondsRemaining + secondsDelta);
      const newTotal = Math.max(prev.totalDuration, newSec);
      return {
        ...prev,
        secondsRemaining: newSec,
        totalDuration: newTotal,
        isRunning: newSec > 0 ? prev.isRunning : false,
      };
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer({
      secondsRemaining: 0,
      totalDuration: 0,
      isRunning: false,
      exerciseName: '',
      setNumber: 0,
    });
  }, []);

  // Helper to find previous performance for ghost values
  const getPreviousPerformance = useCallback(
    (exerciseId: string, setIndex: number) => {
      for (const workout of workoutHistory) {
        const matchingExercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
        if (matchingExercise && matchingExercise.sets[setIndex]) {
          const s = matchingExercise.sets[setIndex];
          if (s.completed && s.weight > 0) {
            return { weight: s.weight, reps: s.reps };
          }
        }
      }
      return undefined;
    },
    [workoutHistory]
  );

  // Start Workout
  const startWorkout = useCallback(
    (templateId?: string, customName?: string) => {
      const template = templateId ? ROUTINE_TEMPLATES.find((t) => t.id === templateId) : null;
      const workoutName = customName || template?.name || 'Quick Workout';

      const exercises: WorkoutExercise[] = [];

      if (template) {
        template.exerciseIds.forEach((exId) => {
          const def = EXERCISE_LIBRARY.find((e) => e.id === exId);
          if (def) {
            const sets: WorkoutSet[] = [1, 2, 3].map((num, idx) => {
              const prev = getPreviousPerformance(def.id, idx);
              return {
                id: `s-${Date.now()}-${def.id}-${num}`,
                setNumber: num,
                type: num === 1 ? 'warmup' : 'normal',
                weight: prev?.weight ?? (def.category === 'barbell' ? 135 : 50),
                reps: prev?.reps ?? 10,
                completed: false,
                previousWeight: prev?.weight,
                previousReps: prev?.reps,
              };
            });

            exercises.push({
              id: `we-${Date.now()}-${def.id}`,
              exerciseId: def.id,
              name: def.name,
              primaryMuscle: def.primaryMuscle,
              secondaryMuscles: def.secondaryMuscles,
              sets,
            });
          }
        });
      }

      const newSession: WorkoutSession = {
        id: `workout-${Date.now()}`,
        name: workoutName,
        startTime: Date.now(),
        durationSeconds: 0,
        exercises,
        completed: false,
        totalTonnage: 0,
      };

      setActiveWorkout(newSession);
    },
    [getPreviousPerformance]
  );

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    stopRestTimer();
  }, [stopRestTimer]);

  const addExerciseToWorkout = useCallback(
    (exerciseId: string) => {
      const def = EXERCISE_LIBRARY.find((e) => e.id === exerciseId);
      if (!def) return;

      setActiveWorkout((prev) => {
        if (!prev) {
          // If no active workout, start one automatically with this exercise
          const prevPerf = getPreviousPerformance(def.id, 0);
          return {
            id: `workout-${Date.now()}`,
            name: `${def.name} Workout`,
            startTime: Date.now(),
            durationSeconds: 0,
            completed: false,
            totalTonnage: 0,
            exercises: [
              {
                id: `we-${Date.now()}-${def.id}`,
                exerciseId: def.id,
                name: def.name,
                primaryMuscle: def.primaryMuscle,
                secondaryMuscles: def.secondaryMuscles,
                sets: [
                  {
                    id: `s-${Date.now()}-1`,
                    setNumber: 1,
                    type: 'normal',
                    weight: prevPerf?.weight ?? 100,
                    reps: prevPerf?.reps ?? 10,
                    completed: false,
                    previousWeight: prevPerf?.weight,
                    previousReps: prevPerf?.reps,
                  },
                ],
              },
            ],
          };
        }

        const prevPerf = getPreviousPerformance(def.id, 0);
        const newExercise: WorkoutExercise = {
          id: `we-${Date.now()}-${def.id}`,
          exerciseId: def.id,
          name: def.name,
          primaryMuscle: def.primaryMuscle,
          secondaryMuscles: def.secondaryMuscles,
          sets: [
            {
              id: `s-${Date.now()}-1`,
              setNumber: 1,
              type: 'normal',
              weight: prevPerf?.weight ?? 100,
              reps: prevPerf?.reps ?? 10,
              completed: false,
              previousWeight: prevPerf?.weight,
              previousReps: prevPerf?.reps,
            },
          ],
        };

        return {
          ...prev,
          exercises: [...prev.exercises, newExercise],
        };
      });
    },
    [getPreviousPerformance]
  );

  const removeExerciseFromWorkout = useCallback((exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter((e) => e.id !== exerciseId),
      };
    });
  }, []);

  const addSetToExercise = useCallback((workoutExerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSetNum = ex.sets.length + 1;
          const newSet: WorkoutSet = {
            id: `s-${Date.now()}-${newSetNum}`,
            setNumber: newSetNum,
            type: 'normal',
            weight: lastSet ? lastSet.weight : 100,
            reps: lastSet ? lastSet.reps : 10,
            completed: false,
            previousWeight: lastSet?.previousWeight,
            previousReps: lastSet?.previousReps,
          };
          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }),
      };
    });
  }, []);

  const removeSetFromExercise = useCallback((workoutExerciseId: string, setId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          const filteredSets = ex.sets.filter((s) => s.id !== setId);
          // Renumber sets
          const renumbered = filteredSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
          return {
            ...ex,
            sets: renumbered,
          };
        }),
      };
    });
  }, []);

  const updateSet = useCallback((workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          };
        }),
      };
    });
  }, []);

  const toggleSetComplete = useCallback(
    (workoutExerciseId: string, setId: string) => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        let exerciseName = '';
        let setNum = 0;
        let setWasCompletedNow = false;

        const updatedExercises = prev.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          exerciseName = ex.name;

          return {
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id !== setId) return s;
              const willBeCompleted = !s.completed;
              if (willBeCompleted) {
                setWasCompletedNow = true;
                setNum = s.setNumber;
              }
              return { ...s, completed: willBeCompleted };
            }),
          };
        });

        // Trigger rest timer on completing set
        if (setWasCompletedNow) {
          const exDef = EXERCISE_LIBRARY.find((e) => e.name === exerciseName);
          const restSeconds = exDef?.defaultRestSec ?? settings.defaultRestSeconds;
          startRestTimer(restSeconds, exerciseName, setNum);
        }

        return {
          ...prev,
          exercises: updatedExercises,
        };
      });
    },
    [settings.defaultRestSeconds, startRestTimer]
  );

  const updateActiveWorkoutNotes = useCallback((notes: string) => {
    setActiveWorkout((prev) => (prev ? { ...prev, notes } : null));
  }, []);

  // Finish workout & detect personal records
  const finishWorkout = useCallback((): WorkoutSession | null => {
    if (!activeWorkout) return null;

    const endTime = Date.now();
    const duration = Math.max(60, Math.floor((endTime - activeWorkout.startTime) / 1000));

    // Calculate total tonnage: sum of (weight * reps) for all completed sets
    let totalTonnage = 0;
    const detectedPRs: Array<{
      exerciseName: string;
      weight: number;
      reps: number;
      estimated1RM: number;
    }> = [];

    activeWorkout.exercises.forEach((ex) => {
      // Find highest historic 1RM for this exercise
      let maxHistorical1RM = 0;
      workoutHistory.forEach((oldW) => {
        const oldEx = oldW.exercises.find((e) => e.exerciseId === ex.exerciseId);
        if (oldEx) {
          oldEx.sets.forEach((s) => {
            if (s.completed && s.weight > 0 && s.reps > 0) {
              const old1RM = calculate1RM(s.weight, s.reps);
              if (old1RM > maxHistorical1RM) maxHistorical1RM = old1RM;
            }
          });
        }
      });

      let sessionBest1RM = 0;
      let bestSetRecord: { weight: number; reps: number } | null = null;

      for (const s of ex.sets) {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          totalTonnage += s.weight * s.reps;
          const current1RM = calculate1RM(s.weight, s.reps);
          if (current1RM > sessionBest1RM) {
            sessionBest1RM = current1RM;
            bestSetRecord = { weight: s.weight, reps: s.reps };
          }
        }
      }

      if (sessionBest1RM > maxHistorical1RM && maxHistorical1RM > 0 && bestSetRecord) {
        detectedPRs.push({
          exerciseName: ex.name,
          weight: bestSetRecord.weight,
          reps: bestSetRecord.reps,
          estimated1RM: sessionBest1RM,
        });
      }
    });

    const finishedSession: WorkoutSession = {
      ...activeWorkout,
      endTime,
      durationSeconds: duration,
      completed: true,
      totalTonnage,
      newPRs: detectedPRs.length > 0 ? detectedPRs : undefined,
    };

    setWorkoutHistory((prev) => [finishedSession, ...prev]);
    setActiveWorkout(null);
    stopRestTimer();

    if (detectedPRs.length > 0 && settings.showPRCelebration) {
      setLastCelebratedPR(detectedPRs);
      if (settings.soundAlerts) {
        soundManager.playPRFanfare();
      }
    }

    return finishedSession;
  }, [activeWorkout, workoutHistory, settings.showPRCelebration, settings.soundAlerts, stopRestTimer]);

  const clearPRCelebration = useCallback(() => {
    setLastCelebratedPR(null);
  }, []);

  // Nutrition handlers
  const addNutritionEntry = useCallback((entry: Omit<NutritionEntry, 'id' | 'timestamp'>) => {
    const newEntry: NutritionEntry = {
      ...entry,
      id: `nutr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    setNutrition((prev) => ({
      ...prev,
      entries: [newEntry, ...prev.entries],
    }));
  }, []);

  const removeNutritionEntry = useCallback((entryId: string) => {
    setNutrition((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== entryId),
    }));
  }, []);

  const adjustWater = useCallback((deltaMl: number) => {
    setNutrition((prev) => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl + deltaMl),
    }));
  }, []);

  const updateNutritionGoals = useCallback(
    (goals: {
      targetCalories?: number;
      targetProtein?: number;
      targetCarbs?: number;
      targetFat?: number;
      targetWaterMl?: number;
    }) => {
      setNutrition((prev) => ({
        ...prev,
        ...goals,
      }));
    },
    []
  );

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Export / Import
  const exportDataJson = useCallback(() => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      workoutHistory,
      nutrition,
    };
    return JSON.stringify(backup, null, 2);
  }, [settings, workoutHistory, nutrition]);

  const importDataJson = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.workoutHistory && Array.isArray(data.workoutHistory)) {
        setWorkoutHistory(data.workoutHistory);
      }
      if (data.nutrition) {
        setNutrition(data.nutrition);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        workoutHistory,
        exerciseLibrary: EXERCISE_LIBRARY,
        activeWorkoutDuration,
        muscleRecovery,
        restTimer,
        startRestTimer,
        pauseRestTimer,
        resumeRestTimer,
        adjustRestTimer,
        stopRestTimer,
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
        nutrition,
        addNutritionEntry,
        removeNutritionEntry,
        adjustWater,
        updateNutritionGoals,
        settings,
        updateSettings,
        exportDataJson,
        importDataJson,
        selectedMuscleForDrawer,
        setSelectedMuscleForDrawer,
        lastCelebratedPR,
        clearPRCelebration,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
