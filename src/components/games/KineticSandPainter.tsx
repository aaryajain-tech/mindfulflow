import React, { useRef, useEffect, useState } from 'react';
import { Palette, Trash2, Sparkles } from 'lucide-react';

interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const COLOR_PALETTES = {
  sunset: ['#f43f5e', '#fb923c', '#facc15', '#a855f7'],
  aurora: ['#2dd4bf', '#3b82f6', '#818cf8', '#c084fc'],
  forest: ['#34d399', '#10b981', '#059669', '#a7f3d0'],
  sand: ['#fef08a', '#fde047', '#eab308', '#ca8a04'],
};

export const KineticSandPainter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePalette, setActivePalette] = useState<keyof typeof COLOR_PALETTES>('aurora');
  const [particleSize, setParticleSize] = useState(4);

  const particlesRef = useRef<SandParticle[]>([]);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Soft trail fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)'; // Dark subtle backdrop fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const colors = COLOR_PALETTES[activePalette];

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; // fluid drag
        p.vy *= 0.98;
        p.alpha -= 0.008;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [activePalette]);

  const addParticlesAt = (x: number, y: number) => {
    const colors = COLOR_PALETTES[activePalette];
    const count = 5;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: particleSize * (0.6 + Math.random() * 0.8),
        color,
        alpha: 0.9,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addParticlesAt(x, y);
    lastPosRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addParticlesAt(x, y);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    particlesRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span>Kinetic Sand Pixel Painter</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Drag cursor or finger across canvas to spin glowing, meditative particle trails.
          </p>
        </div>

        <button
          onClick={clearCanvas}
          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          title="Clear Painter"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Palette Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Palette:</span>
          {(Object.keys(COLOR_PALETTES) as (keyof typeof COLOR_PALETTES)[]).map((pal) => (
            <button
              key={pal}
              onClick={() => setActivePalette(pal)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition ${
                activePalette === pal
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-200/90 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-300'
              }`}
            >
              {pal}
            </button>
          ))}
        </div>

        {/* Particle Size */}
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
          <span>Particle Size:</span>
          <input
            type="range"
            min="2"
            max="8"
            value={particleSize}
            onChange={(e) => setParticleSize(parseInt(e.target.value))}
            className="w-24 accent-rose-500"
          />
        </div>
      </div>

      {/* Interactive Painter Canvas */}
      <div className="relative w-full h-[360px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
