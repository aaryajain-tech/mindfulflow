import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { Brain, Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface BrainDumpScratchpadProps {
  onAddTasks: (newTasks: Task[]) => void;
}

export const BrainDumpScratchpad: React.FC<BrainDumpScratchpadProps> = ({ onAddTasks }) => {
  const [dumpText, setDumpText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!dumpText.trim()) return;

    setIsLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dumpText }),
      });

      const data = await res.json();
      const extractedTasks = data.tasks || [];

      if (extractedTasks.length > 0) {
        const formatted: Task[] = extractedTasks.map((t: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          text: t.text,
          completed: false,
          priority: (t.priority as Priority) || 'medium',
          category: (t.category as Category) || 'quick_win',
          createdAt: Date.now(),
        }));

        onAddTasks(formatted);
        setDumpText('');
        setSuccessMsg(`Successfully converted into ${formatted.length} actionable tasks!`);
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setSuccessMsg('No tasks extracted. Try adding a bit more detail!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Brain dump conversion failed:', err);
      // Local fallback parsing
      const lines = dumpText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 2);

      const fallbackTasks: Task[] = lines.slice(0, 5).map((l, index) => ({
        id: `${Date.now()}-${index}`,
        text: l,
        completed: false,
        priority: 'medium',
        category: 'quick_win',
        createdAt: Date.now(),
      }));

      if (fallbackTasks.length > 0) {
        onAddTasks(fallbackTasks);
        setDumpText('');
        setSuccessMsg(`Extracted ${fallbackTasks.length} tasks!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Brain Dump Scratchpad
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Unload chaotic thoughts or mental overwhelm. AI will structure them into clear step-by-step tasks.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <textarea
          rows={5}
          value={dumpText}
          onChange={(e) => setDumpText(e.target.value)}
          placeholder="Dump everything on your mind... e.g., 'Need to finish report by 3pm, buy groceries for dinner, feeling stressed about apartment clean up, reply to Alex's email, organize desk'"
          className="w-full p-4 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition font-medium resize-y"
        />

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
            Gemini AI parses chaos into prioritized actionable items.
          </p>

          <button
            onClick={handleConvert}
            disabled={isLoading || !dumpText.trim()}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Structuring Thoughts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert to Actionable Tasks</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
