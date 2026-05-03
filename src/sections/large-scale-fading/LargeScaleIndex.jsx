import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Signal, MoveDownRight, Map, Cloud, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/large-scale-fading/fspl',
    icon: Signal,
    title: 'Free Space Path Loss',
    description: 'Understand how signal power decays over distance in a vacuum according to the inverse-square law.',
    color: '#3b82f6',
    badge: 'Interactive Graph',
  },
  {
    path: '/large-scale-fading/two-ray',
    icon: MoveDownRight,
    title: 'Two-Ray Model',
    description: 'Explore the effect of ground reflections and see how multi-path interference creates breakpoint distances.',
    color: '#06b6d4',
    badge: 'Visualization',
  },
  {
    path: '/large-scale-fading/okumura-hata',
    icon: Map,
    title: 'Okumura-Hata Model',
    description: 'Apply empirical models for urban, suburban, and rural environments to estimate real-world path loss.',
    color: '#8b5cf6',
    badge: 'Empirical',
  },
  {
    path: '/large-scale-fading/shadowing',
    icon: Cloud,
    title: 'Log-Normal Shadowing',
    description: 'Visualize statistical variations in path loss due to terrain contours and large obstacles like buildings.',
    color: '#14b8a6',
    badge: 'Statistics',
  },
];

export default function LargeScaleIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>Section 4</span>
        </div>
        <h1 className="mb-3">Large-Scale Fading</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Large-scale fading models predict the average signal strength over large distances. These models are crucial for estimating coverage areas, cell sizes, and link budgets.
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Free Space Path Loss (dB)', formula: '32.44 + 20log(f) + 20log(d)' },
              { label: 'Two-Ray Model (Pr)', formula: 'Pt * Gt * Gr * (ht*hr)² / d⁴' },
              { label: 'Log-Normal Shadowing', formula: 'PL(d) + X_σ' },
              { label: 'Coverage Prob (Edge)', formula: 'Q((PL_min - PL_avg) / σ)' },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>{f.label}</div>
                <div className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'var(--color-accent-teal)' }} title={f.formula}>{f.formula}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
