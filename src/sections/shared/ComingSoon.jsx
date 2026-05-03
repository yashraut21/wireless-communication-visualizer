import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft, ArrowRight } from 'lucide-react';
import { SECTIONS } from '../../utils/constants';

export default function ComingSoon() {
  const location = useLocation();
  const currentSection = SECTIONS.find((s) => location.pathname.startsWith(s.path));

  return (
    <div className="section-container py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
             style={{ background: 'oklch(0.82 0.14 80 / 0.1)' }}>
          <Construction size={32} style={{ color: 'var(--color-accent-amber)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-3">Coming Soon</h1>
        <p className="text-base mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          This section is under development. Check back soon for interactive visualizations
          and hands-on learning tools.
        </p>

        {currentSection && (
          <div className="glass-card p-5 mb-6 text-left">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent-teal)' }}>
              Planned topics for {currentSection.title}
            </h3>
            <div className="space-y-2">
              {currentSection.topics.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: currentSection.color }} />
                  {t.title}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline glass-card"
                style={{ color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <Link to="/fundamentals" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
                style={{ background: 'var(--color-accent-teal)', color: 'var(--color-text-inverse)' }}>
            Explore Fundamentals <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
