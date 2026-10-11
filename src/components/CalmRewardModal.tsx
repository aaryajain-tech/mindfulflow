import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote } from '../types';
import { Sparkles, X, RefreshCw, Trophy, Heart } from 'lucide-react';

interface CalmRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalmRewardModal: React.FC<CalmRewardModalProps> = ({ isOpen, onClose }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quote', { method: 'POST' });
      const data = await res.json();
      setQuote(data);
    } catch {
      setQuote({
        text: 'Almost everything will work again if you unplug it for a few minutes, including you.',
        author: 'Anne Lamott',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuote();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Trophy Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-teal-400 text-white flex items-center justify-center shadow-lg mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Calm Meter 100% Unlocked!</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Mindful Mastery Achieved
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              You chose presence over scrolling today. Enjoy this uplifting wisdom:
            </p>

            {/* Quote Card */}
            <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 relative">
              {isLoading ? (
                <div className="py-6 text-slate-400 text-xs font-medium animate-pulse">
                  Summoning mindful wisdom...
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                    "{quote?.text}"
                  </p>
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-3">
                    — {quote?.author}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchQuote}
                disabled={isLoading}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>New Quote</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                Continue Flow
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
