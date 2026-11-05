# ApexLift: Gym Progress & Muscle Recovery Tracker

A performance-focused gym training companion designed to log progressive overload workouts, track daily macro and calorie targets, and visualize muscle group fatigue and recovery through an interactive anatomical heatmap.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your selections in Phase 1, the core architecture and interface have been tailored around your preferences:
>
> - **Visual Muscle Group Breakdown**: Interactive anatomical body heatmap (front and back views) mapping cumulative volume and recovery status across major muscle groups (chest, back, shoulders, quads, hamstrings, glutes, core, calves, biceps, triceps).
> - **Workout Logging Experience**: Complete set-by-set tracker with previous performance ghost values, target reps, weight, RPE, live rest timer with audio/visual chimes, and automatic PR detection.
> - **Food & Nutrition Tracker**: Daily calorie & macronutrient goals (protein, carbs, fats) with rapid meal logging, quick water counter, and an optional toggle to show/hide nutrition based on user focus.
> - **Visual Theme**: High-energy dark athletic mode utilizing deep obsidian surfaces (`#090D14`), structural borders (`#1A2234`), electric neon lime (`#D4FF00` / `#A3E635`) for active metrics & PRs, and cyan (`#06B6D4` / `#22D3EE`) for recovery & hydration indicators.

---

### 1. Overview & Core Concept

**ApexLift** solves the friction lifters face when switching between generic note apps, clunky spreadsheet logs, and separate calorie counters. By unifying structured strength training, muscle recovery modeling, and nutrition targets into a cohesive, responsive interface, users get real-time training intelligence without cognitive clutter.

- **Target Audience**: Strength athletes, bodybuilders, and fitness enthusiasts wanting actionable workout tracking, progressive overload guidance, and recovery visualization.
- **Key Value Proposition**: Instant visual clarity on which muscle groups are primed for training versus fatigued, seamless in-gym logging with rest timers, and lightweight macro tracking.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Starting or Logging a Workout**:
   - The user selects an existing routine (e.g. *Push Hypertrophy*, *Pull Power*, *Leg Day*, *Upper Body*) or starts an empty quick workout.
   - For each exercise, previous session weights and reps appear as ghost hints. The user logs completed sets, toggles warm-up vs working sets, and marks sets complete.
   - Completing a set automatically starts an unobtrusive floating rest countdown timer (e.g., 90s, 120s) with quick +/- 15s adjustments.
   - New personal records (1RM calculations based on Brzycki/Epley formula) trigger instant celebratory visual badges.
2. **Exploring Muscle Fatigue & Recovery Heatmap**:
   - The user navigates to the **Muscle Recovery** tab featuring an interactive SVG anatomical body map (front & back views).
   - Muscle groups display dynamic color states based on recent training volume and elapsed recovery hours (Fresh / Ready $\ge 48\text{h}$, Optimal $24\text{--}48\text{h}$, Fatigued/Recovering $< 24\text{h}$, Overworked).
   - Tapping any muscle group (e.g. *Chest / Pectorals*) slides open a drawer revealing recent sets performed, exercise history, estimated 1RM trends, and recommended next training window.
3. **Macro & Nutrition Tracking (Optional / Toggleable)**:
   - A dedicated Nutrition section (which can be toggled on or hidden in user preferences) displays radial macro rings for Calories, Protein, Carbohydrates, and Fats.
   - Quick-add meal entries with instant macro calculation, favorite food presets, and a quick-tap water tracker.
4. **Analytics & Progress History**:
   - Volume progression charts over time (weekly tonnage per muscle group), workout history log with calendar heatmap, and export/import functionality for data portability.

#### Visual Identity & Theme
- **Theme Canvas (60%)**: Deep obsidian `#080C14` and slate background `#0F172A` providing optimal contrast in gym lighting conditions.
- **Structural Surfaces (30%)**: Card containers in `#111827` with crisp hairline borders `#1F293D`, subtle backdrop blurs on sticky nav and floating rest timer.
- **Accents (10%)**:
  - *Electric Lime* (`#D4FF00` / `#A3E635`): Primary CTAs, active set checkboxes, PR notifications, and training volume peaks.
  - *Electric Cyan* (`#22D3EE` / `#06B6D4`): Hydration progress, recovered muscle indicators, and secondary metrics.
  - *Recovery Gradient*: Emerald (`Fresh`) $\rightarrow$ Cyan (`Recovered`) $\rightarrow$ Amber (`Recovering`) $\rightarrow$ Rose/Coral (`Fatigued`).
- **Typography**:
  - Display: `Outfit` / `Barlow Condensed` for athletic headlines, stat values, and exercise titles.
  - Body & UI: `Plus Jakarta Sans` for clean, legibility-first labels and workout notes.
  - Metrics & Numbers: Tabular figures (`font-mono tabular-nums`) for weight, reps, timers, and calorie counts.

---

### 3. Key Product Decisions & Trade-Offs

- **Interactive Anatomical Body Heatmap**:
  - *Chosen Approach*: Clean vector SVG anatomical illustration split into interactive anatomical paths (trapezius, deltoids, pectorals, biceps, triceps, forearms, lats, abs, obliques, glutes, quadriceps, hamstrings, calves) with front/back toggle.
  - *Why*: Delivers crisp visual feedback without heavy 3D WebGL bundle overhead, ensuring instant loading on mobile devices in gym connectivity conditions.
  - *Alternatives Considered*: Three.js 3D human mesh was evaluated, but would introduce significant bundle size and battery drain while working out.
- **Workout State & Active Rest Timer**:
  - *Chosen Approach*: Persistent state management that continues tracking elapsed workout time and rest intervals even when switching tabs to check food or muscle stats. Includes browser audio chime (synthesized Web Audio API tone) and visual flash when the rest timer reaches zero.
  - *Why*: Lifters frequently switch apps or tabs; the workout and timer must never reset unintentionally.
- **Data Persistence Strategy**:
  - *Chosen Approach*: Local storage with structured schema, automatic timestamping, initial realistic seed data (sample workouts, PRs, and food logs), plus one-click JSON backup export/import.
  - *Why*: Instant offline availability in gym basements without sign-in friction, while guaranteeing zero data loss.
- **Modular Nutrition Tracker**:
  - *Chosen Approach*: Fully featured macro & calorie tracker with an explicit settings toggle to hide nutrition cards if the user wants a pure strength lifting log.
  - *Why*: Respects the user's explicit requirement that food tracking should be optional.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              ApexLift App                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
│     Workout Engine    │ │   Muscle Heatmap  │ │   Nutrition Engine    │
│  - Active Session     │ │  - Front/Back SVG │ │  - Macro Rings (P/C/F)│
│  - Rest Timer (Audio) │ │  - Fatigue Engine │ │  - Meal Quick-Log     │
│  - PR & 1RM Calculate │ │  - Muscle Drawer  │ │  - Water Hydration    │
│  - Routine Templates  │ │  - Volume Balance │ │  - Toggle On/Off      │
└───────────┬───────────┘ └─────────┬─────────┘ └───────────┬───────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Unified State Store & LocalStorage                   │
│   (Workouts, Exercise Library, Recovery Timers, Nutrition, Settings)   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- `WorkoutSession`: ID, name, date, duration, notes, exercises (array of completed sets with weight, reps, RPE, completed status, PR flag).
- `Exercise`: ID, name, primary muscle group, secondary muscle groups, equipment type, personal record (max weight, max calculated 1RM).
- `MuscleGroupData`: Group ID, name, view (front/back), lastTrainedTimestamp, cumulative7DaySets, recoveryHoursEstimated (0-100% recovery score).
- `NutritionDay`: Date, targetCalories, targetProtein, targetCarbs, targetFat, meals (breakfast, lunch, dinner, snacks with items, grams, calories, macros), waterMl.
- `AppSettings`: Unit (`kg` vs `lbs`), defaultRestTimeSeconds, soundEnabled, foodTrackerEnabled.

---

### 5. Step-by-Step Implementation Roadmap

1. **Foundations & Design System**:
   - Configure Tailwind theme tokens for obsidian canvas, slate surfaces, electric lime, and cyan accents.
   - Setup Web Audio API synthesized sound generator for rest timer chimes.
2. **State Engine & Seed Data**:
   - Implement storage manager with comprehensive initial seed workouts, routine presets (Push/Pull/Legs), and exercise database covering all major muscle groups.
   - Implement 1RM formulas (Epley & Brzycki) and progressive overload PR detector.
3. **Interactive Anatomical Body Heatmap**:
   - Construct front and back anatomical SVG graphics with selectable muscle zones.
   - Build recovery algorithm calculating muscle readiness based on elapsed time and volume intensity.
   - Interactive drill-down modal showing exercises and recovery recommendations for tapped muscles.
4. **Workout Logger & Active Session**:
   - Workout view with routine starter, exercise search, set-by-set logging, previous weight hints, and set completion checkboxes.
   - Non-intrusive floating rest timer with +/-15s adjustments and audio completion alert.
5. **Optional Macro & Food Tracker**:
   - Calorie & macro visualizer with circular SVG progress dials.
   - Meal logging system with quick calorie/protein input, meal presets, and water tracker.
   - Settings toggle to easily show or hide the nutrition module.
6. **Analytics & Progress Visuals**:
   - Weekly muscle volume distribution chart and strength progression metrics.
   - JSON export and import for user data backups.
