import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Activity, Radio, ArrowRight, Network } from 'lucide-react';

const TOPICS = [
  {
    path: '/gsm/frame-structure',
    icon: Activity,
    title: 'Time-Frame Structure',
    description: 'Drill down through the GSM hierarchy: Hyperframes, Superframes, Multiframes, Frames, and Burst Bits.',
    color: '#06b6d4',
    badge: 'Interactive',
  },
  {
    path: '/gsm/signal-processing',
    icon: Network,
    title: 'Signal Processing Chain',
    description: 'Step through the pipeline from analog speech to an encrypted, interleaved digital radio burst.',
    color: '#3b82f6',
    badge: 'Flowchart',
  },
  {
    path: '/gsm/speech-coding',
    icon: Radio,
    title: 'Speech Coding (RPE-LTP)',
    description: 'See how GSM compresses human speech from 64 kbps down to 13 kbps using predictive modeling.',
    color: '#8b5cf6',
    badge: 'Concepts',
  },
  {
    path: '/gsm/handover',
    icon: Smartphone,
    title: 'Mobile-Assisted Handover',
    description: 'Simulate a mobile user moving between cells and visualize how hysteresis prevents ping-pong handovers.',
    color: '#ec4899',
    badge: 'Simulation',
  },
];

export default function GSMIndex() {
  return (
    <div className="section-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>Section 9</span>
        </div>
        <h1 className="mb-3">The GSM System (2G)</h1>
        <p className="text-lg mb-10 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          GSM (Global System for Mobile Communications) was the first widely adopted digital cellular standard. 
          By combining FDMA and TDMA, it revolutionized mobile connectivity. Explore the complex architecture behind this legendary system.
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
