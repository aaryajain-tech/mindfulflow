import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, ShieldAlert, Sparkles, X, Play, Pause, Volume2, CheckCircle2 } from 'lucide-react';
import { soundSynth } from '../lib/soundSynthesizer';

interface HeroGroundingProps {
  isOpenIntervention: boolean;
  onCloseIntervention: () => void;
  onOpenIntervention: () => void;
  onAddCalmPoints: (points: number) => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export const HeroGrounding: React.FC<HeroGroundingProps> = ({
  isOpenIntervention,
  onCloseIntervention,
  onOpenIntervention,
  onAddCalmPoints,
}) => {
  const [greeting, setGreeting] = useState('');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timerCount, setTimerCount] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning, Mindful Soul');
    else if (hour < 18) setGreeting('Good afternoon, Mindful Soul');
    else setGreeting('Good evening, Mindful Soul');
  }, []);

  // Breathing loop timer (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!isBreathingActive) return;

    if (soundEnabled) {
      soundSynth.playBreathingTone(phase);
    }

    const interval = setInterval(() => {
      setTimerCount((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase when countdown hits 1
        if (phase === 'inhale') {
          setPhase('hold');
          return 4;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 4;
        } else {
          setPhase('inhale');
          setCompletedCycles((c) => {
            const next = c + 1;
            onAddCalmPoints(5); // +5% calm per full breath cycle
            return next;
          });
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, phase, soundEnabled, onAddCalmPoints]);

  const handleStartBreathing = () => {
    setIsBreathingActive(true);
    setPhase('inhale');
    setTimerCount(4);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
  };

  return (
    <div className="w-full mb-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500/15 via-indigo-500/15 to-purple-500/15 dark:from-teal-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border border-teal-300/80 dark:border-teal-800/40 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-200/80 dark:bg-teal-950 text-teal-900 dark:text-teal-200 text-xs font-bold mb-3 border border-teal-300 dark:border-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Mindful Check-in</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {greeting}
            </h1>
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base mt-2 leading-relaxed font-medium">
              Tempted to scroll? Pause for a moment. Redirect dopamine into presence, calm reflection, or a quick zen mini-game.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenIntervention}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Urge Intervention (Breath Circle)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Breathing Intervention Modal */}
      <AnimatePresence>
        {isOpenIntervention && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  handleStopBreathing();
                  onCloseIntervention();
                }}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-3">
                  <Wind className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  10-Second Breath Circle
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Box Breathing: Inhale 4s • Hold 4s • Exhale 4s. Feel the urge to scroll wash away.
                </p>
              </div>

              {/* Animated Breathing Circle */}
              <div className="my-8 flex flex-col items-center justify-center">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  {/* Outer pulse ring */}
                  <motion.div
                    animate={{
                      scale: phase === 'inhale' ? [1, 1.3] : phase === 'hold' ? 1.3 : [1.3, 1],
                      opacity: phase === 'inhale' ? [0.3, 0.7] : phase === 'hold' ? 0.8 : [0.8, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400/30 to-indigo-500/30 dark:from-teal-600/30 dark:to-indigo-600/30 blur-md"
                  />

                  {/* Main Circle */}
                  <motion.div
                    animate={{
                      scale: phase === 'inhale' ? 1.25 : phase === 'hold' ? 1.25 : 1,
                    }}
                    transition={{
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className="w-40 h-40 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex flex-col items-center justify-center shadow-xl border-4 border-white/20 relative z-10"
                  >
                    <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
                      {isBreathingActive ? phase : 'Ready'}
                    </span>
                    <span className="text-4xl font-extrabold my-0.5">
                      {isBreathingActive ? timerCount : '4s'}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {phase === 'inhale' ? 'Deep Inhale' : phase === 'hold' ? 'Hold Gently' : 'Slow Exhale'}
                    </span>
                  </motion.div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>Cycles Completed: {completedCycles} (+{completedCycles * 5}% Calm)</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {!isBreathingActive ? (
                  <button
                    onClick={handleStartBreathing}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Breathing</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopBreathing}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 transition"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 rounded-2xl border ${
                    soundEnabled
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  } transition`}
                  title={soundEnabled ? 'Mute tone' : 'Enable tone'}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
