import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Repeat2, Triangle, Shuffle, Layers, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/propagation/reflection',
    icon: Repeat2,
    title: 'Reflection',
    description: 'Drag the receiver to see how angle of incidence, material permittivity, and polarization affect signal strength.',
    color: '#6366f1',
    badge: 'Fresnel Equations',
  },
  {
    path: '/propagation/diffraction',
    icon: Triangle,
    title: 'Diffraction',
    description: 'Knife-edge model: adjust obstacle height and see Fresnel zones and diffraction loss in real time.',
    color: '#14b8a6',
    badge: 'Knife-Edge',
  },
  {
    path: '/propagation/scattering',
    icon: 'Scatter',
    title: 'Scattering',
    description: 'Rough surface scattering: Rayleigh criterion for smooth vs. rough surfaces with visual roughness control.',
    color: '#f59e0b',
    badge: 'Rayleigh',
  },
  {
    path: '/propagation/phasor-sum',
    icon: Layers,
    title: 'Phasor Sum — The "Aha!" Moment',
    description: 'Add multipath components as rotating phasors. See how constructive and destructive interference creates fading.',
    color: '#ec4899',
    badge: '⭐ Key Concept',
  },
];

export default function PropagationIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
          <span className="text-sm font-medium" style={{ color: '#6366f1' }}>Section 3</span>
        </div>
        <h1 className="mb-3">Propagation Mechanisms</h1>
        <p className="text-lg mb-4 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          In the real world, signals don't travel in straight lines. They reflect off buildings,
          diffract around corners, and scatter off rough surfaces — creating the rich, complex
          multipath environment that wireless engineers must understand and exploit.
        </p>

        {/* The 3 mechanisms */}
        <div className="grid grid-cols-3 gap-3 mb-8 p-4 rounded-xl"
             style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
          {[
            { icon: '↗️', name: 'Reflection', cond: 'Object >> λ (smooth, large)' },
            { icon: '🔄', name: 'Diffraction', cond: 'Object ≈ λ (knife-edge)' },
            { icon: '🌀', name: 'Scattering', cond: 'Object << λ (rough surface)' },
          ].map((m) => (
            <div key={m.name} className="text-center p-3">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{m.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{m.cond}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TOPICS.map((topic, i) => {
            const iconColor = topic.color;
            return (
              <motion.div key={topic.path}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}>
                <Link to={topic.path} className="no-underline">
                  <div className="glass-card p-6 h-full group cursor-pointer">
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
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
