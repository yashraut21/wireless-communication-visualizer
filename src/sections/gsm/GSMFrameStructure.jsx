import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoCallout } from '../../components/interactive/ParameterPanel';

export default function GSMFrameStructure() {
  const [zoomLevel, setZoomLevel] = useState(0);

  const levels = [
    {
      title: "Hyperframe",
      duration: "3 hours, 28 minutes, 53.76 seconds",
      desc: "The longest time unit in GSM. Used for ciphering and synchronization. Consists of 2048 Superframes.",
      items: Array.from({ length: 8 }).map((_, i) => (i === 7 ? "..." : `Superframe ${i}`)),
      gridCols: "grid-cols-4"
    },
    {
      title: "Superframe",
      duration: "6.12 seconds",
      desc: "Consists of 51 Multiframe (26-frame traffic) or 26 Multiframe (51-frame control). We'll look at a Traffic Multiframe.",
      items: Array.from({ length: 10 }).map((_, i) => (i === 9 ? "..." : `Multiframe ${i}`)),
      gridCols: "grid-cols-5"
    },
    {
      title: "Multiframe (Traffic)",
      duration: "120 ms",
      desc: "Consists of 26 TDMA Frames. 24 for traffic, 1 for Slow Associated Control Channel (SACCH), 1 idle.",
      items: Array.from({ length: 26 }).map((_, i) => {
        if (i === 12) return "SACCH";
        if (i === 25) return "IDLE";
        return `Frame ${i}`;
      }),
      gridCols: "grid-cols-7"
    },
    {
      title: "TDMA Frame",
      duration: "4.615 ms",
      desc: "Consists of 8 Time Slots. Each active call is assigned one time slot. (This is the TDMA part of GSM).",
      items: Array.from({ length: 8 }).map((_, i) => `Slot ${i}`),
      gridCols: "grid-cols-8"
    },
    {
      title: "Time Slot (Normal Burst)",
      duration: "576.9 μs (156.25 bits)",
      desc: "The actual data burst. Consists of Tail bits, Data, a Training Sequence (for equalization), more Data, Tail bits, and a Guard Period.",
      items: [
        { label: "Tail (3)", color: "#94a3b8", flex: 3 },
        { label: "Data (58)", color: "#3b82f6", flex: 58 },
        { label: "Train (26)", color: "#10b981", flex: 26 },
        { label: "Data (58)", color: "#3b82f6", flex: 58 },
        { label: "Tail (3)", color: "#94a3b8", flex: 3 },
        { label: "Guard (8.25)", color: "#1e293b", flex: 8.25 },
      ],
      isBurst: true
    }
  ];

  const currentLevel = levels[zoomLevel];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>9.1 · GSM System</span>
        </div>
        <h1 className="mb-3">GSM Time-Frame Hierarchy</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          GSM organizes time into a strictly regimented hierarchy. From a massive 3.5 hour Hyperframe down to a tiny 577 microsecond Time Slot, everything happens on a precise schedule.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Zoom Level</h3>
              
              <div className="flex flex-col gap-2 relative">
                {/* Connecting line */}
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-white/10" />
                
                {levels.map((lvl, idx) => (
                  <button key={idx} onClick={() => setZoomLevel(idx)}
                    className={`relative z-10 flex flex-col items-start py-2 px-4 ml-6 text-sm rounded-lg transition-all border ${zoomLevel === idx ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-white' : 'bg-[#1e293b] border-white/10 text-gray-400 hover:border-white/30'}`}>
                    <div className={`absolute -left-[29px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${zoomLevel === idx ? 'bg-[#06b6d4] border-[#06b6d4]' : 'bg-[#0f172a] border-white/30'}`} />
                    <span className="font-bold">{lvl.title}</span>
                    <span className="text-xs opacity-70 font-mono mt-0.5">{lvl.duration}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <InfoCallout type="tip" title="Why a 3.5 hour Hyperframe?">
              The Hyperframe provides a massive Frame Number (FN) that increments continuously. This FN is fed into the encryption algorithms. It takes 3 hours and 28 minutes for the encryption sequence to repeat, making it harder for eavesdroppers!
            </InfoCallout>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={zoomLevel}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col"
              >
                <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent-cyan)' }}>{currentLevel.title}</h2>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{currentLevel.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-gray-500">Duration</div>
                    <div className="font-mono font-bold text-white">{currentLevel.duration}</div>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  {!currentLevel.isBurst ? (
                    <div className={`grid ${currentLevel.gridCols} gap-2 w-full max-w-2xl`}>
                      {currentLevel.items.map((item, i) => (
                        <div key={i} className={`aspect-square rounded flex items-center justify-center text-center text-xs font-bold border transition-colors ${item === '...' ? 'border-transparent text-gray-600' : item === 'SACCH' || item === 'IDLE' ? 'bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#f59e0b]' : 'bg-[#1e293b] border-white/20 text-gray-300 hover:border-[#06b6d4] hover:text-[#06b6d4] cursor-pointer'}`}
                             onClick={() => {
                               if (item !== '...' && item !== 'SACCH' && item !== 'IDLE' && zoomLevel < levels.length - 1) {
                                 setZoomLevel(zoomLevel + 1);
                               }
                             }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl flex flex-col gap-2">
                      <div className="text-xs text-gray-500 mb-2">156.25 bits total (transmitted at 270.833 kbps)</div>
                      <div className="flex w-full h-24 rounded-lg overflow-hidden border border-white/20">
                        {currentLevel.items.map((part, i) => (
                          <div key={i} className="flex items-center justify-center text-center text-[10px] font-bold border-r border-black/20 last:border-0"
                               style={{ flex: part.flex, background: part.color, color: part.color === '#1e293b' ? '#64748b' : 'white' }}>
                            <div className="-rotate-90 md:rotate-0 whitespace-nowrap">{part.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-center mt-4 text-gray-400">
                        The <strong>Training Sequence</strong> in the middle is known by the receiver and used to estimate the multipath channel for the equalizer. The <strong>Guard Period</strong> prevents bursts from adjacent slots from colliding due to propagation delays.
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Comprehend the massive time-scale hierarchy in a cellular network.<br/>
          <strong>Action:</strong> Click through the hierarchy boxes to zoom from Hyperframe down to Time Slot.<br/>
          <strong>Practical Conclusion:</strong> You can see how a 3.5 hour encryption cycle is built from 577-microsecond physical bursts. This strict TDMA timing means your phone must transmit its burst exactly at the right microsecond, accounting for the speed of light delay between you and the tower (using Timing Advance).
        </InfoCallout>
      </motion.div>
    </div>
  );
}
