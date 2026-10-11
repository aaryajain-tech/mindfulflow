import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { speechManager } from '../lib/speech';
import { soundSynth } from '../lib/soundSynthesizer';
import {
  Plus,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Briefcase,
  Heart,
  Coffee,
  Zap,
  Filter,
} from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskCompleted: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  setTasks,
  onTaskCompleted,
}) => {
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('quick_win');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [speakingTaskId, setSpeakingTaskId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText.trim(),
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTaskText('');
  };

  // Mic Speech-To-Text input
  const toggleVoiceInput = () => {
    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
      return;
    }

    setMicError(null);
    const started = speechManager.startListening({
      onResult: (transcript) => {
        setTaskText(transcript);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        setMicError('Speech recognition unavailable or permission denied.');
        setTimeout(() => setMicError(null), 4000);
      },
    });

    if (started) {
      setIsListening(true);
    } else {
      setMicError('Web Speech API is not supported in this browser.');
      setTimeout(() => setMicError(null), 4000);
    }
  };

  // Voice Readout (TTS) for a task
  const handleSpeakTask = (task: Task) => {
    if (speakingTaskId === task.id) {
      speechManager.stopSpeaking();
      setSpeakingTaskId(null);
      return;
    }

    setSpeakingTaskId(task.id);
    const textToSpeak = `Task item: ${task.text}. Priority ${task.priority}. Category ${task.category}. You've got this!`;
    
    const spoken = speechManager.speakText(textToSpeak, () => {
      setSpeakingTaskId(null);
    });

    if (!spoken) {
      // Server fallback via /api/tts
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.audioBase64) {
            const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
            audio.onended = () => setSpeakingTaskId(null);
            audio.play();
          } else {
            setSpeakingTaskId(null);
          }
        })
        .catch(() => setSpeakingTaskId(null));
    }
  };

  // Toggle Complete
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            soundSynth.playChimeSuccess();
            onTaskCompleted();
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'health':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'relax':
        return <Coffee className="w-3.5 h-3.5 text-emerald-500" />;
      case 'quick_win':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-bold';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold';
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold';
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Intentional To-Do Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-bold border border-teal-300 dark:border-teal-800">
              {completedCount}/{tasks.length} Completed
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Replace mindless reels with purposeful micro-actions. Speak or type your tasks.
          </p>
        </div>

        {/* Clear Completed */}
        {completedCount > 0 && (
          <button
            onClick={() => setTasks((prev) => prev.filter((t) => !t.completed))}
            className="text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition"
          >
            Clear Completed
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="mb-8">
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : 'Type a task (e.g. Read 5 pages, Drink water, Call mom)...'}
              className="w-full pl-4 pr-24 py-3.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition font-medium"
            />

            {/* Mic Voice Input Button */}
            <div className="absolute right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                title="Voice Input (Speak task)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!taskText.trim()}
                className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {micError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 px-2 font-semibold">{micError}</p>
          )}

          {/* Options: Priority & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category:</span>
              {(['quick_win', 'health', 'work', 'relax'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex items-center gap-1.5 border transition ${
                    category === cat
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Priority:</span>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize border transition ${
                    priority === p
                      ? getPriorityBadge(p)
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-slate-200 dark:border-slate-800 py-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Status:</span>
          {(['all', 'active', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-800'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Priority Filters */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="quick_win">Quick Win</option>
            <option value="health">Health</option>
            <option value="work">Work</option>
            <option value="relax">Relax</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Sparkles className="w-8 h-8 mx-auto text-teal-400 mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No tasks found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add a new task or speak one aloud to build your calm momentum!
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                task.completed
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-sm hover:border-teal-300 dark:hover:border-teal-700'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-500 fill-teal-100 dark:fill-teal-950" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium leading-snug truncate ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100 font-semibold'
                    }`}
                  >
                    {task.text}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {getCategoryIcon(task.category)}
                      {task.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-md font-semibold uppercase border ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Speak button */}
                <button
                  onClick={() => handleSpeakTask(task)}
                  className={`p-2 rounded-xl transition ${
                    speakingTaskId === task.id
                      ? 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 animate-pulse'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Read aloud (TTS)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition rounded-xl"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
