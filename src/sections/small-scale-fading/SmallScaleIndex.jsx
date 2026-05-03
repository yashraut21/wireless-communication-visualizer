import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Activity, FastForward, Waves, Box, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/small-scale-fading/pdp',
    icon: BarChart2,
    title: 'Power Delay Profile (PDP)',
    description: 'Visualize how multipath reflections arrive at different times and powers. Calculate mean excess delay and RMS delay spread.',
    color: '#3b82f6',
    badge: 'Interactive',
  },
  {
    path: '/small-scale-fading/delay-spread',
    icon: Activity,
    title: 'Delay Spread & Coherence Bandwidth',
    description: 'Understand the relationship between time-domain delay spread and frequency-selective fading.',
    color: '#06b6d4',
    badge: 'Concepts',
  },
  {
    path: '/small-scale-fading/doppler',
    icon: FastForward,
    title: 'Doppler Spread & Coherence Time',
    description: 'See how movement causes frequency shifts (Jakes spectrum) and dictates how fast a channel changes.',
    color: '#8b5cf6',
    badge: 'Animation',
  },
  {
    path: '/small-scale-fading/rayleigh-ricean',
    icon: Waves,
    title: 'Rayleigh vs Ricean Fading',
    description: 'Compare the statistical distributions of signal envelope with and without a strong Line-Of-Sight (LOS) path.',
    color: '#14b8a6',
    badge: 'Statistics',
  },
  {
    path: '/small-scale-fading/fading-simulator',
    icon: Box,
    title: 'Fading Simulator (3D)',
    description: 'A 3D ray-tracing environment visualizing how moving through a multipath environment creates small-scale fading.',
    color: '#ef4444',
    badge: '3D Scene',
  },
];

export default function SmallScaleIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>Section 5</span>
        </div>
        <h1 className="mb-3">Small-Scale Fading</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          While large-scale fading predicts average power over distances, small-scale fading describes rapid fluctuations 
          in amplitude, phase, or multipath delays over short distances or time intervals.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {TOPICS.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div key={topic.path}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link to={topic.path} className="no-underline">
                  <div className="glass-card p-6 h-full group cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                           style={{ background: `color-mix(in oklch, ${topic.color} 15%, transparent)` }}>
                        <Icon size={24} style={{ color: topic.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {topic.title}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `color-mix(in oklch, ${topic.color} 15%, transparent)`, color: topic.color }}>
                            {topic.badge}
                          </span>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                          {topic.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: topic.color }}>
                          Start exploring <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Key formula preview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card p-6 mt-8"
          style={{ background: 'linear-gradient(135deg, oklch(0.18 0.04 250 / 0.4), oklch(0.16 0.03 270 / 0.2))' }}>
          <h3 className="text-base font-semibold mb-3">The Duality of Fading</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
              <div className="font-semibold mb-2" style={{ color: 'var(--color-accent-teal)' }}>Time Dispersion → Frequency Fading</div>
              <p className="text-xs mb-2 text-gray-400">Multipath delay spread causes the channel to vary across frequency.</p>
              <div className="font-mono text-xs" style={{ color: 'var(--color-accent-blue)' }}>Coherence Bandwidth: B_c ≈ 1 / (5σ_τ)</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
              <div className="font-semibold mb-2" style={{ color: 'var(--color-accent-violet)' }}>Frequency Dispersion → Time Fading</div>
              <p className="text-xs mb-2 text-gray-400">Doppler shifts cause the channel to vary across time.</p>
              <div className="font-mono text-xs" style={{ color: 'var(--color-accent-amber)' }}>Coherence Time: T_c ≈ 0.423 / f_m</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
