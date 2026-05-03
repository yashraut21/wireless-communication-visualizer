import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Activity, Zap, Radio, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/modulation/constellation',
    icon: Target,
    title: 'Constellation Diagrams',
    description: 'Visualize how digital bits are mapped to phase and amplitude in BPSK, QPSK, and QAM under noisy conditions.',
    color: '#06b6d4',
    badge: 'Interactive',
  },
  {
    path: '/modulation/pulse-shaping',
    icon: Activity,
    title: 'Pulse Shaping',
    description: 'See how Nyquist filtering (Raised Cosine) limits bandwidth and prevents Inter-Symbol Interference (ISI).',
    color: '#3b82f6',
    badge: 'Concepts',
  },
  {
    path: '/modulation/gmsk',
    icon: Radio,
    title: 'GMSK',
    description: 'Explore Gaussian Minimum Shift Keying, the constant-envelope modulation scheme behind 2G GSM.',
    color: '#8b5cf6',
    badge: 'Simulation',
  },
  {
    path: '/modulation/ber-fading',
    icon: Zap,
    title: 'BER in Fading',
    description: 'Compare Bit Error Rate performance across AWGN, Rayleigh fading, and Diversity channels.',
    color: '#ef4444',
    badge: 'Charts',
  },
];

export default function ModulationIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>Section 7</span>
        </div>
        <h1 className="mb-3">Modulation Techniques</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Modulation is the process of varying a carrier signal to transmit information. Discover how modern digital systems 
          pack more bits into less bandwidth while surviving noisy channels.
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
      </motion.div>
    </div>
  );
}
