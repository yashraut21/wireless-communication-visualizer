import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Layers, SignalHigh, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    path: '/diversity/concept',
    icon: GitBranch,
    title: 'Diversity Concept',
    description: 'Understand how combining multiple independent fading paths drastically reduces the probability of deep fades.',
    color: '#06b6d4',
    badge: 'Concepts',
  },
  {
    path: '/diversity/combining',
    icon: Layers,
    title: 'Combining Methods',
    description: 'Compare Selection Combining, Equal Gain Combining, and Maximal Ratio Combining algorithms.',
    color: '#3b82f6',
    badge: 'Interactive',
  },
  {
    path: '/diversity/rake',
    icon: SignalHigh,
    title: 'Rake Receiver',
    description: 'See how CDMA systems use a Rake Receiver to capture and combine delayed multipath components.',
    color: '#8b5cf6',
    badge: 'Simulation',
  },
];

export default function DiversityIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>Section 6</span>
        </div>
        <h1 className="mb-3">Diversity Techniques</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Fading causes severe signal drops. Diversity is the primary technique to combat this by providing the receiver 
          with multiple independent copies of the transmitted signal in space, frequency, or time.
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
