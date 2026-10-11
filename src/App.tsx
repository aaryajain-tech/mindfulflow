import React, { useState, useEffect } from 'react';
import { Task, TabType } from './types';
import { Navbar } from './components/Navbar';
import { HeroGrounding } from './components/HeroGrounding';
import { TodoList } from './components/TodoList';
import { BubblePoppingZen } from './components/games/BubblePoppingZen';
import { PatternMatchZen } from './components/games/PatternMatchZen';
import { KineticSandPainter } from './components/games/KineticSandPainter';
import { AmbientSoundscape } from './components/AmbientSoundscape';
import { BrainDumpScratchpad } from './components/BrainDumpScratchpad';
import { CalmRewardModal } from './components/CalmRewardModal';
import { Sparkles, Gamepad2, Volume2, ShieldCheck } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    text: 'Take 3 deep abdominal breaths before picking up phone',
    completed: true,
    priority: 'high',
    category: 'health',
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    text: 'Drink a glass of warm water & stretch for 2 mins',
    completed: false,
    priority: 'medium',
    category: 'health',
    createdAt: Date.now() - 1800000,
  },
  {
    id: '3',
    text: 'Read 5 pages of a physical book or focus article',
    completed: false,
    priority: 'low',
    category: 'relax',
    createdAt: Date.now(),
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mindfulflow_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('mindfulflow_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_TASKS; }
    }
    return INITIAL_TASKS;
  });

  const [calmMeter, setCalmMeter] = useState<number>(() => {
    const saved = localStorage.getItem('mindfulflow_calm');
    return saved ? parseFloat(saved) : 35;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('mindfulflow_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [isOpenIntervention, setIsOpenIntervention] = useState(false);
  const [isOpenRewardModal, setIsOpenRewardModal] = useState(false);

  // Sync Dark mode to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mindfulflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mindfulflow_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist Tasks
  useEffect(() => {
    localStorage.setItem('mindfulflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist Calm Meter
  useEffect(() => {
    localStorage.setItem('mindfulflow_calm', calmMeter.toString());
  }, [calmMeter]);

  // Persist Streak
  useEffect(() => {
    localStorage.setItem('mindfulflow_streak', streakDays.toString());
  }, [streakDays]);

  // Handle Calm Meter Addition & Rewards
  const addCalmPoints = (points: number) => {
    setCalmMeter((prev) => {
      const next = prev + points;
      if (next >= 100 && prev < 100) {
        setIsOpenRewardModal(true);
      }
      return Math.min(100, Math.max(0, next));
    });
  };

  const handleTaskCompleted = () => {
    addCalmPoints(12); // +12% calm per task completed
  };

  const handleAddTasksFromBrainDump = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    setActiveTab('dashboard'); // Switch back to dashboard to view new tasks
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-teal-500/20">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        calmMeter={calmMeter}
        streakDays={streakDays}
        onOpenIntervention={() => setIsOpenIntervention(true)}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Grounding Header Banner */}
        <HeroGrounding
          isOpenIntervention={isOpenIntervention}
          onCloseIntervention={() => setIsOpenIntervention(false)}
          onOpenIntervention={() => setIsOpenIntervention(true)}
          onAddCalmPoints={addCalmPoints}
        />

        {/* Tab 1: Dashboard & To-Do */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <TodoList
              tasks={tasks}
              setTasks={setTasks}
              onTaskCompleted={handleTaskCompleted}
            />

            {/* Quick Access to Mini-Games Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border border-indigo-200/50 dark:border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-sm">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Need a gentle mental break?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Try Bubble Popping Zen, Memory Flow, or Kinetic Sand Painter to relax your mind.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('games')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Explore Zen Games
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Zen Mini-Games */}
        {activeTab === 'games' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Brain-Calming Micro-Games</span>
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Low-Stress Interactive Sanctuary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero timers, zero high-stakes penalties. Pure sensory relaxation to replace doomscrolling.
              </p>
            </div>

            <BubblePoppingZen />
            <PatternMatchZen />
            <KineticSandPainter />
          </div>
        )}

        {/* Tab 3: Sounds & Brain Dump */}
        {activeTab === 'sounds_dump' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Soundscapes & Mental Declutter</span>
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Acoustic Focus & AI Brain Dump
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synthesize custom ambient noise and transform unorganized thoughts into structured steps.
              </p>
            </div>

            <AmbientSoundscape />
            <BrainDumpScratchpad onAddTasks={handleAddTasksFromBrainDump} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-center text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>MindfulFlow • Built for presence, mental clarity & intentional focus</span>
          </p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Made with love and vibes with AARYA JAIN ❤️
          </p>
        </div>
      </footer>

      {/* Calm Meter 100% Unlocked Reward Modal */}
      <CalmRewardModal
        isOpen={isOpenRewardModal}
        onClose={() => setIsOpenRewardModal(false)}
      />
    </div>
  );
}
