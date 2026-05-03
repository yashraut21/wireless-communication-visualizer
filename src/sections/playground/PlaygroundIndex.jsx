import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, LineChart, Activity, Wifi, Settings2, ArrowRight } from 'lucide-react';

const TOOLS = [
  {
    path: '/playground/link-budget',
    icon: Calculator,
    title: 'Link Budget Calculator',
    description: 'A comprehensive waterfall calculator for determining if a wireless link will close over a specific distance with given hardware.',
    color: '#06b6d4',
    badge: 'System Design',
  },
  {
    path: '/playground/propagation-comparator',
    icon: LineChart,
    title: 'Model Comparator',
    description: 'Compare Free Space, Two-Ray, and Okumura-Hata propagation models side-by-side to understand environmental impacts.',
    color: '#3b82f6',
    badge: 'Analysis',
  },
  {
    path: '/playground/fading-pro',
    icon: Activity,
    title: 'Fading Simulator Pro',
    description: 'Advanced multipath fading analysis with real-time envelope generation and live Rayleigh/Ricean PDF histogram fitting.',
    color: '#8b5cf6',
    badge: 'Simulation',
  },
  {
    path: '/playground/array-designer',
    icon: Wifi,
    title: 'Array Designer',
    description: 'Design phased antenna arrays. Tweak element counts, spacing, and progressive phase shifts to beamform the radiation pattern.',
    color: '#ec4899',
    badge: 'Antennas',
  },
  {
    path: '/playground/constellation',
    icon: Settings2,
    title: 'Constellation Viz Pro',
    description: 'Inject specific hardware impairments (Phase Noise, I/Q Imbalance, AWGN) into digital QAM constellations.',
    color: '#f59e0b',
    badge: 'Modulation',
  },
];

export default function PlaygroundIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-amber)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-amber)' }}>Section 10</span>
        </div>
        <h1 className="mb-3">Engineering Playground</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Transition from theoretical concepts to practical engineering. These sandbox tools allow you to design, simulate, and analyze wireless systems using industry-standard parameters.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div key={tool.path}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <Link to={tool.path} className="no-underline">
                  <div className="glass-card p-6 h-full group cursor-pointer border border-transparent hover:border-white/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                           style={{ background: `color-mix(in oklch, ${tool.color} 15%, transparent)` }}>
                        <Icon size={24} style={{ color: tool.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {tool.title}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `color-mix(in oklch, ${tool.color} 15%, transparent)`, color: tool.color }}>
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                          {tool.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: tool.color }}>
                          Launch Tool <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
