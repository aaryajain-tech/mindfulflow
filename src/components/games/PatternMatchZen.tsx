import React, { useState, useEffect } from 'react';
import { soundSynth } from '../../lib/soundSynthesizer';
import { Sun, Droplets, Leaf, Wind, Mountain, Waves, Moon, Flower2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Tile {
  id: number;
  symbolId: number;
  icon: React.ReactNode;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = [
  { id: 1, name: 'Lotus', icon: <Flower2 className="w-6 h-6 text-pink-500" /> },
  { id: 2, name: 'Sun', icon: <Sun className="w-6 h-6 text-amber-500" /> },
  { id: 3, name: 'Drop', icon: <Droplets className="w-6 h-6 text-cyan-500" /> },
  { id: 4, name: 'Leaf', icon: <Leaf className="w-6 h-6 text-emerald-500" /> },
  { id: 5, name: 'Wind', icon: <Wind className="w-6 h-6 text-teal-500" /> },
  { id: 6, name: 'Mountain', icon: <Mountain className="w-6 h-6 text-indigo-500" /> },
  { id: 7, name: 'Wave', icon: <Waves className="w-6 h-6 text-blue-500" /> },
  { id: 8, name: 'Moon', icon: <Moon className="w-6 h-6 text-purple-500" /> },
];

export const PatternMatchZen: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const initializeBoard = () => {
    const selectedSymbols = SYMBOLS.slice(0, 6); // 6 pairs = 12 tiles
    const duplicated = [...selectedSymbols, ...selectedSymbols];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((sym, index) => ({
        id: index,
        symbolId: sym.id,
        icon: sym.icon,
        name: sym.name,
        isFlipped: false,
        isMatched: false,
      }));

    setTiles(shuffled);
    setFlippedIds([]);
    setMoves(0);
    setMatchesCount(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  const handleTileClick = (id: number) => {
    if (flippedIds.length >= 2) return;
    const clickedTile = tiles.find((t) => t.id === id);
    if (!clickedTile || clickedTile.isFlipped || clickedTile.isMatched) return;

    soundSynth.playTileFlip();

    // Flip tile
    const updatedTiles = tiles.map((t) => (t.id === id ? { ...t, isFlipped: true } : t));
    setTiles(updatedTiles);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const tile1 = updatedTiles.find((t) => t.id === firstId);
      const tile2 = updatedTiles.find((t) => t.id === secondId);

      if (tile1 && tile2 && tile1.symbolId === tile2.symbolId) {
        // Match!
        soundSynth.playChimeSuccess();
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === firstId || t.id === secondId ? { ...t, isMatched: true } : t
            )
          );
          setFlippedIds([]);
          setMatchesCount((c) => {
            const next = c + 1;
            if (next === 6) setIsCompleted(true);
            return next;
          });
        }, 500);
      } else {
        // No match -> Flip back softly
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === firstId || t.id === secondId ? { ...t, isFlipped: false } : t
            )
          );
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-indigo-500" />
            <span>Memory Flow Pattern Match</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Zero timer, zero stress. Gently flip tiles to pair nature harmony symbols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 rounded-xl border border-indigo-300 dark:border-indigo-800">
            Matches: {matchesCount}/6
          </div>
          <button
            onClick={initializeBoard}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Reset Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mb-6 p-4 rounded-2xl bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 text-teal-950 dark:text-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
            <div>
              <p className="font-extrabold text-sm">Harmonious Flow Achieved!</p>
              <p className="text-xs font-medium opacity-90">Completed in {moves} gentle moves.</p>
            </div>
          </div>
          <button
            onClick={initializeBoard}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 max-w-lg mx-auto">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile.id)}
            disabled={tile.isMatched || tile.isFlipped}
            className={`h-24 sm:h-28 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-2 shadow-sm ${
              tile.isFlipped || tile.isMatched
                ? 'bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-700 scale-100'
                : 'bg-gradient-to-br from-indigo-100 via-teal-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer'
            }`}
          >
            {tile.isFlipped || tile.isMatched ? (
              <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
                {tile.icon}
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                  {tile.name}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/60 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">•</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
