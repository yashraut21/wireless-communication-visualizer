import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoCallout } from '../../components/interactive/ParameterPanel';

export default function AccessComparison() {
  const [scheme, setScheme] = useState('FDMA');

  const schemeInfo = {
    FDMA: {
      title: 'Frequency Division Multiple Access',
      desc: 'The spectrum is divided into narrow frequency bands. Each user gets their own dedicated frequency channel for the entire duration of their call.',
      users: [
        { id: 1, color: '#ef4444', label: 'User A' },
        { id: 2, color: '#3b82f6', label: 'User B' },
        { id: 3, color: '#10b981', label: 'User C' },
        { id: 4, color: '#f59e0b', label: 'User D' },
      ],
      drawBlocks: (users) => {
        // 4 columns, 4 rows. Each user gets a full column.
        return Array.from({ length: 16 }).map((_, i) => {
          const col = i % 4;
          const user = users[col];
          return (
            <motion.div key={i}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded border border-white/20 flex items-center justify-center text-xs font-bold"
              style={{ background: user.color, height: '60px' }}
            >
              {user.label[user.label.length - 1]}
            </motion.div>
          );
        });
      }
    },
    TDMA: {
      title: 'Time Division Multiple Access',
      desc: 'Users share the same broad frequency band, but they take turns. Each user is assigned a specific time slot to transmit or receive.',
      users: [
        { id: 1, color: '#ef4444', label: 'User A' },
        { id: 2, color: '#3b82f6', label: 'User B' },
        { id: 3, color: '#10b981', label: 'User C' },
        { id: 4, color: '#f59e0b', label: 'User D' },
      ],
      drawBlocks: (users) => {
        // 4 rows, 4 cols. Each user gets a full row.
        return Array.from({ length: 16 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const user = users[row];
          return (
            <motion.div key={i}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded border border-white/20 flex items-center justify-center text-xs font-bold"
              style={{ background: user.color, height: '60px' }}
            >
              {user.label[user.label.length - 1]}
            </motion.div>
          );
        });
      }
    },
    CDMA: {
      title: 'Code Division Multiple Access',
      desc: 'Everyone transmits at the same time, over the exact same frequency band! They are separated by mathematically orthogonal spreading codes.',
      users: [
        { id: 1, color: '#8b5cf6', label: 'All Users (Coded)' },
      ],
      drawBlocks: (users) => {
        // 4x4 grid, all mixed colors
        return Array.from({ length: 16 }).map((_, i) => {
          return (
            <motion.div key={i}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded border border-white/20 flex items-center justify-center relative overflow-hidden"
              style={{ height: '60px', background: '#333' }}
            >
              {/* Simulate mixed codes with a cool gradient/pattern */}
              <div className="absolute inset-0 opacity-80" 
                   style={{ background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #3b82f6 10px, #3b82f6 20px, #10b981 20px, #10b981 30px, #f59e0b 30px, #f59e0b 40px)' }} />
              <span className="relative z-10 text-white text-xs font-bold bg-black/50 px-1 rounded">ABCD</span>
            </motion.div>
          );
        });
      }
    }
  };

  const current = schemeInfo[scheme];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>8.1 · Multiple Access</span>
        </div>
        <h1 className="mb-3">FDMA / TDMA / CDMA</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          To allow many users to share a cell tower, we must divide the available radio resources. The three primary dimensions are Frequency, Time, and Code.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Select Access Scheme</h3>
              
              <div className="flex flex-col gap-2">
                {Object.keys(schemeInfo).map(s => (
                  <button key={s} onClick={() => setScheme(s)}
                    className={`py-3 px-4 text-sm font-semibold rounded-lg transition-all text-left border ${scheme === s ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4]' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>
                    {s} — {schemeInfo[s].title}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2 text-white">Users in System:</h4>
                <div className="flex flex-wrap gap-2">
                  {current.users.map(u => (
                    <div key={u.id} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm" style={{ background: u.color }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>{u.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6 border-l-4 border-l-[#06b6d4]">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {current.desc}
              </p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[500px]">
              {/* Axes labels */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-gray-400">
                TIME (t) ➔
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">
                FREQUENCY (f) ➔
              </div>
              
              <div className="grid grid-cols-4 gap-1 p-1 border-2 border-white/10 rounded-lg bg-black/20" style={{ height: '300px' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={scheme} className="col-span-4 grid grid-cols-4 gap-1 h-full w-full">
                    {current.drawBlocks(current.users)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-12 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              A "Resource Block" diagram showing how time and frequency are partitioned.
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Understand how radio resources are divided among multiple users.<br/>
          <strong>Action:</strong> Click through FDMA, TDMA, and CDMA options.<br/>
          <strong>Practical Conclusion:</strong> Notice how FDMA and TDMA create hard "boundaries" (dedicated channels or slots) where a user cannot exceed their limit. In CDMA, there are no hard boundaries—users share the entire space. The limit in CDMA isn't strict slots, but rather the total noise floor (interference) created by all overlapping users!
        </InfoCallout>

        <InfoCallout type="tip" title="Real-World Usage">
          <strong>1G (AMPS)</strong> used pure FDMA. <strong>2G (GSM)</strong> used a combination of FDMA and TDMA (splitting frequencies, then splitting those frequencies into 8 time slots). <strong>3G (UMTS)</strong> used CDMA. Modern <strong>4G/5G</strong> systems use OFDMA, which is a highly advanced grid combining frequency and time divisions down to tiny resource blocks.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
