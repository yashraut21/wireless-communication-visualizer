import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Target, Layers, Repeat, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/antennas/types',
    icon: Radio,
    title: 'Antenna Types',
    description: 'Compare isotropic, dipole, patch, and Yagi antennas with interactive 3D radiation patterns.',
    color: '#3b82f6',
    badge: '3D Patterns',
  },
  {
    path: '/antennas/radiation-patterns',
    icon: Target,
    title: 'Radiation Patterns',
    description: 'Explore 2D polar plots and 3D lobes. Adjust directivity and see how gain concentrates energy.',
    color: '#06b6d4',
    badge: 'Polar Plot',
  },
  {
    path: '/antennas/beamforming',
    icon: Layers,
    title: 'Beamforming & Array Factor',
    description: 'Steer a beam by adjusting phase shifts. See how N-element arrays shape the radiation pattern.',
    color: '#8b5cf6',
    badge: 'Interactive',
  },
  {
    path: '/antennas/polarization',
    icon: Repeat,
    title: 'Polarization',
    description: 'Visualize linear, circular, and elliptical polarization. Understand polarization mismatch loss.',
    color: '#14b8a6',
    badge: 'Animation',
  },
];

export default function AntennasIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>Section 2</span>
        </div>
        <h1 className="mb-3">Antennas</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Antennas are the interface between guided electromagnetic waves (in cables) and free-space propagation.
          Understanding their patterns and gain is fundamental to any wireless system design.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {TOPICS.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div key={topic.path}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link to={topic.path} className="no-underline">
                  <div className="glass-card p-6 h-full group cursor-pointer">
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
          <h3 className="text-base font-semibold mb-3">Key Formulas in This Section</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Gain–Efficiency', formula: 'G = η · D' },
              { label: 'Effective Area', formula: 'Aₑ = G · λ² / (4π)' },
              { label: 'Friis Equation', formula: 'Pr = Pt · Gt · Gr · (λ/4πd)²' },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{f.label}</div>
                <div className="font-mono text-sm" style={{ color: 'var(--color-accent-teal)' }}>{f.formula}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
