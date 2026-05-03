import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, Radio as RadioIcon, BarChart3, Hexagon, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/fundamentals/waves',
    icon: Waves,
    title: 'What is a Wave?',
    description: 'Explore 3D animated waves. Adjust frequency, amplitude, and see c = fλ in action.',
    color: '#14b8a6',
  },
  {
    path: '/fundamentals/em-spectrum',
    icon: RadioIcon,
    title: 'The EM Spectrum',
    description: 'Interactive spectrum from 3 kHz to 300 GHz. See where WiFi, 4G, and 5G live.',
    color: '#6366f1',
  },
  {
    path: '/fundamentals/decibels',
    icon: BarChart3,
    title: 'Decibels (dB, dBm, dBi)',
    description: 'Convert between watts and dBm. See why 3 dB = double power with visual analogies.',
    color: '#f59e0b',
  },
  {
    path: '/fundamentals/cellular-concept',
    icon: Hexagon,
    title: 'The Cellular Concept',
    description: 'Rotate a 3D hexagonal grid. Adjust cluster size and see co-channel reuse distance.',
    color: '#8b5cf6',
  },
];

export default function FundamentalsIndex() {
  return (
    <div className="section-container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>
            Section 1
          </span>
        </div>
        <h1 className="mb-3">Fundamentals</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Build your foundation — understand the physics of electromagnetic waves, the frequency spectrum,
          the decibel system, and how cellular networks are organized.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <motion.div
              key={topic.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to={topic.path} className="no-underline">
                <div className="glass-card p-6 h-full group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{
                        background: `color-mix(in oklch, ${topic.color} 15%, transparent)`,
                      }}
                    >
                      <Icon size={24} style={{ color: topic.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {topic.title}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        {topic.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium"
                            style={{ color: topic.color }}>
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
    </div>
  );
}
