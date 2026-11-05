/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkoutProvider } from './context/WorkoutContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { WorkoutLogger } from './components/WorkoutLogger';
import { MuscleHeatmap } from './components/MuscleHeatmap';
import { NutritionTracker } from './components/NutritionTracker';
import { AnalyticsView } from './components/AnalyticsView';
import { MuscleDrawer } from './components/MuscleDrawer';
import { RestTimer } from './components/RestTimer';
import { PRCelebrationModal } from './components/PRCelebrationModal';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('workout');

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-[#D4FF00] selection:text-black">
      {/* 3-Zone Top Navigation */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Responsive Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        {currentTab === 'workout' && <WorkoutLogger />}
        {currentTab === 'heatmap' && <MuscleHeatmap onSelectMuscle={() => {}} />}
        {currentTab === 'nutrition' && <NutritionTracker />}
        {currentTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Muscle Group Detail Slide Drawer */}
      <MuscleDrawer />

      {/* Floating Rest Countdown Timer with Audio Ticks */}
      <RestTimer />

      {/* PR Celebration Fanfare & Confetti Modal */}
      <PRCelebrationModal />
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}
