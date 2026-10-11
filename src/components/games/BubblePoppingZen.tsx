import React, { useRef, useEffect, useState } from 'react';
import { soundSynth } from '../../lib/soundSynthesizer';
import { RefreshCw, Play, Volume2, Sparkles } from 'lucide-react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  word: string;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

interface FloatingWord {
  id: number;
  x: number;
  y: number;
  word: string;
  alpha: number;
  vy: number;
}

const CALM_WORDS = [
  'Peace',
  'Focus',
  'Breathe',
  'Serenity',
  'Clarity',
  'Grace',
  'Stillness',
  'Joy',
  'Presence',
  'Harmony',
  'Grounded',
  'Softness',
];

const BUBBLE_COLORS = [
  'hsla(168, 70%, 75%, 0.6)', // Teal pastel
  'hsla(215, 80%, 78%, 0.6)', // Soft Blue
  'hsla(260, 70%, 80%, 0.6)', // Lavender
  'hsla(330, 80%, 82%, 0.6)', // Rose Pastel
  'hsla(45, 90%, 78%, 0.6)',  // Soft Gold
];

export const BubblePoppingZen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [popCount, setPopCount] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const wordsRef = useRef<FloatingWord[]>([]);
  const animFrameId = useRef<number | null>(null);

  const spawnBubbles = (count = 12) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const newBubbles: Bubble[] = [];
    for (let i = 0; i < count; i++) {
      newBubbles.push({
        id: Math.random(),
        x: Math.random() * (width - 80) + 40,
        y: Math.random() * (height - 80) + 40,
        radius: 28 + Math.random() * 24,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.6,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        word: CALM_WORDS[Math.floor(Math.random() * CALM_WORDS.length)],
        alpha: 0.85,
      });
    }
    bubblesRef.current = newBubbles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (bubblesRef.current.length === 0) {
        spawnBubbles(12);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update and draw bubbles
      const width = canvas.width;
      const height = canvas.height;

      bubblesRef.current.forEach((b) => {
        b.x += b.vx * speedMultiplier;
        b.y += b.vy * speedMultiplier;

        // Wrap around canvas edges
        if (b.y + b.radius < 0) b.y = height + b.radius;
        if (b.x - b.radius < 0) b.x = width + b.radius;
        if (b.x + b.radius > width) b.x = -b.radius;

        // Draw Bubble
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        // Highlight shine
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // 2. Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.life -= 1;

        if (p.alpha <= 0 || p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('0.6', `${p.alpha}`);
        ctx.fill();
        ctx.restore();
      }

      // 3. Update and draw floating words
      for (let i = wordsRef.current.length - 1; i >= 0; i--) {
        const w = wordsRef.current[i];
        w.y += w.vy;
        w.alpha -= 0.012;

        if (w.alpha <= 0) {
          wordsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark
          ? `rgba(45, 212, 191, ${w.alpha})`
          : `rgba(13, 116, 107, ${w.alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(w.word, w.x, w.y);
        ctx.restore();
      }

      // Auto-replenish bubbles if too low
      if (bubblesRef.current.length < 5) {
        spawnBubbles(6);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [speedMultiplier]);

  // Handle Bubble Pop Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let popped = false;

    bubblesRef.current = bubblesRef.current.filter((b) => {
      const dist = Math.hypot(clickX - b.x, clickY - b.y);
      if (dist <= b.radius && !popped) {
        popped = true;
        soundSynth.playBubblePop();
        setPopCount((p) => p + 1);

        // Spawn Burst Particles
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          particlesRef.current.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 3 + Math.random() * 4,
            color: b.color,
            alpha: 1,
            life: 30,
          });
        }

        // Add Floating Word
        wordsRef.current.push({
          id: Math.random(),
          x: b.x,
          y: b.y - 10,
          word: b.word,
          alpha: 1,
          vy: -1,
        });

        return false; // remove popped bubble
      }
      return true;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span>Bubble Popping Zen</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Tap floating pastel bubbles to release calming intentions and soft audio chimes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 font-extrabold text-xs rounded-xl border border-teal-300 dark:border-teal-800">
            Pops: {popCount}
          </div>

          <button
            onClick={() => spawnBubbles(12)}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            title="Respawn Bubbles"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-3 mb-4 text-xs font-bold text-slate-700 dark:text-slate-300">
        <span>Float Speed:</span>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.2"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
          className="w-32 accent-teal-600"
        />
        <span>{speedMultiplier}x</span>
      </div>

      {/* Interactive Canvas */}
      <div className="relative w-full h-[360px] rounded-2xl bg-gradient-to-b from-teal-100/60 via-indigo-50/50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-300 dark:border-slate-800 overflow-hidden cursor-pointer shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
