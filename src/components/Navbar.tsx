import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { Flower2, Sun, Moon, Sparkles, CheckCircle2, Gamepad2, Volume2, Flame } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  calmMeter: number; // 0 to 100
  streakDays: number;
  onOpenIntervention: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  calmMeter,
  streakDays,
  onOpenIntervention,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-slate-900/75 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                MindfulFlow
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Anti-Doomscroll Companion
              </p>
            </div>
          </div>

          {/* Quick Stats for Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Dashboard & To-Do</span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'games'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Zen Games</span>
          </button>

          <button
            onClick={() => setActiveTab('sounds_dump')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'sounds_dump'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-sm border border-slate-200 dark:border-slate-600'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Sounds & Dump</span>
          </button>
        </nav>

        {/* Desktop Controls: Calm Meter, Streak & Theme */}
        <div className="hidden md:flex items-center gap-3">
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{streakDays} Day Streak</span>
          </div>

          {/* Calm Meter Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-100/90 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800/40 rounded-xl text-teal-950 dark:text-teal-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Calm: {Math.round(calmMeter)}%</span>
            <div className="w-12 h-2 bg-teal-200 dark:bg-teal-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-500"
                style={{ width: `${Math.min(100, calmMeter)}%` }}
              />
            </div>
          </div>

          {/* Intervention Button */}
          <button
            onClick={onOpenIntervention}
            className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 active:scale-95 transition"
          >
            Urge Intervention
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            aria-label="Toggle Dark Mode"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Live Clock */}
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[55px] text-right">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
