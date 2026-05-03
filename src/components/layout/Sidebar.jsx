import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLearningStore } from '../../store/useLearningStore';
import { SECTIONS } from '../../utils/constants';

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, isTopicCompleted } = useLearningStore();

  // Find current section
  const currentSection = SECTIONS.find((s) =>
    location.pathname.startsWith(s.path)
  );

  if (!currentSection) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 48 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0 overflow-hidden hidden md:block"
      style={{
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="w-full flex items-center justify-center py-3 cursor-pointer border-none bg-transparent transition-colors"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-3 pb-6"
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {currentSection.title}
          </h3>

          <nav className="space-y-1">
            {currentSection.topics.map((topic, index) => {
              const isActive = location.pathname === topic.path;
              const completed = isTopicCompleted(topic.id);

              return (
                <Link
                  key={topic.id}
                  to={topic.path}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all"
                  style={{
                    background: isActive ? 'oklch(0.75 0.15 185 / 0.1)' : 'transparent',
                    color: isActive
                      ? 'var(--color-accent-teal)'
                      : 'var(--color-text-secondary)',
                    borderLeft: isActive ? '2px solid var(--color-accent-teal)' : '2px solid transparent',
                  }}
                >
                  {completed ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green)' }} />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
                      style={{
                        border: `1.5px solid ${isActive ? 'var(--color-accent-teal)' : 'var(--color-border-default)'}`,
                        color: isActive ? 'var(--color-accent-teal)' : 'var(--color-text-tertiary)',
                        fontSize: '10px',
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span className="truncate">{topic.title}</span>
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </motion.aside>
  );
}
