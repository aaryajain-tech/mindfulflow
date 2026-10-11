import React, { useState } from 'react';
import { soundSynth } from '../lib/soundSynthesizer';
import { CloudRain, Wind, Radio, Waves, Volume2, Play, Pause, Sparkles } from 'lucide-react';

interface SoundChannel {
  id: string;
  name: string;
  type: 'rain' | 'wind' | 'brown' | 'ocean';
  icon: React.ReactNode;
  active: boolean;
  volume: number;
  description: string;
}

export const AmbientSoundscape: React.FC = () => {
  const [channels, setChannels] = useState<SoundChannel[]>([
    {
      id: 'rain',
      name: 'Gentle Rain',
      type: 'rain',
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
      active: false,
      volume: 0.6,
      description: 'Soft rhythmic raindrops with subtle drip clicks',
    },
    {
      id: 'wind',
      name: 'Soft Wind',
      type: 'wind',
      icon: <Wind className="w-5 h-5 text-teal-500" />,
      active: false,
      volume: 0.5,
      description: 'Soothing mountain breeze with gentle lowpass gusts',
    },
    {
      id: 'brown',
      name: 'Brown Noise',
      type: 'brown',
      icon: <Radio className="w-5 h-5 text-amber-500" />,
      active: false,
      volume: 0.5,
      description: 'Deep, warm acoustic rumble for deep concentration',
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      type: 'ocean',
      icon: <Waves className="w-5 h-5 text-cyan-500" />,
      active: false,
      volume: 0.6,
      description: 'Periodic swells resembling coastal tide surges',
    },
  ]);

  const [masterVolume, setMasterVolume] = useState(0.8);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          const nextActive = !ch.active;
          if (nextActive) {
            startSound(ch.type, ch.id, ch.volume);
          } else {
            soundSynth.stopSound(ch.id);
          }
          return { ...ch, active: nextActive };
        }
        return ch;
      })
    );
  };

  const handleVolumeChange = (id: string, vol: number) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          soundSynth.updateVolume(id, vol);
          return { ...ch, volume: vol };
        }
        return ch;
      })
    );
  };

  const startSound = (type: 'rain' | 'wind' | 'brown' | 'ocean', id: string, vol: number) => {
    switch (type) {
      case 'rain':
        soundSynth.startRain(id, vol);
        break;
      case 'wind':
        soundSynth.startWind(id, vol);
        break;
      case 'brown':
        soundSynth.startBrownNoise(id, vol);
        break;
      case 'ocean':
        soundSynth.startOcean(id, vol);
        break;
    }
  };

  const applyPreset = (presetName: string) => {
    soundSynth.stopAll();
    let updated = channels.map((c) => ({ ...c, active: false }));

    if (presetName === 'rainstorm') {
      updated = updated.map((c) =>
        c.id === 'rain' ? { ...c, active: true, volume: 0.7 } : c.id === 'wind' ? { ...c, active: true, volume: 0.4 } : c
      );
    } else if (presetName === 'focus') {
      updated = updated.map((c) =>
        c.id === 'brown' ? { ...c, active: true, volume: 0.6 } : c.id === 'rain' ? { ...c, active: true, volume: 0.3 } : c
      );
    } else if (presetName === 'coastal') {
      updated = updated.map((c) =>
        c.id === 'ocean' ? { ...c, active: true, volume: 0.7 } : c.id === 'wind' ? { ...c, active: true, volume: 0.3 } : c
      );
    }

    setChannels(updated);
    updated.forEach((ch) => {
      if (ch.active) startSound(ch.type, ch.id, ch.volume);
    });
  };

  const stopAllSounds = () => {
    soundSynth.stopAll();
    setChannels((prev) => prev.map((c) => ({ ...c, active: false })));
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-teal-500" />
            <span>Ambient Sound Generator</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Web Audio synthesized soundscapes to block background noise and ground your focus.
          </p>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700">
          <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMasterVolume(val);
              soundSynth.setMasterVolume(val);
            }}
            className="w-24 accent-teal-600"
          />
        </div>
      </div>

      {/* Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">Quick Presets:</span>
        <button
          onClick={() => applyPreset('rainstorm')}
          className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 font-bold hover:opacity-90 transition"
        >
          Cozy Rainstorm
        </button>
        <button
          onClick={() => applyPreset('focus')}
          className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-bold hover:opacity-90 transition"
        >
          Deep Focus
        </button>
        <button
          onClick={() => applyPreset('coastal')}
          className="px-3 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-800 font-bold hover:opacity-90 transition"
        >
          Coastal Ocean
        </button>
        <button
          onClick={stopAllSounds}
          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold hover:bg-slate-300 transition ml-auto"
        >
          Mute All
        </button>
      </div>

      {/* Sound Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className={`p-4 rounded-2xl border transition-all duration-200 ${
              ch.active
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-sm'
                : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-300 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                  {ch.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {ch.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {ch.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleChannel(ch.id)}
                className={`p-2.5 rounded-xl transition shadow-sm ${
                  ch.active
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {ch.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Channel Volume Slider */}
            {ch.active && (
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-teal-200/50 dark:border-teal-800/40">
                <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ch.volume}
                  onChange={(e) => handleVolumeChange(ch.id, parseFloat(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
