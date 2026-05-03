import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, ChevronDown,
  Waves, Radio, Zap, TrendingDown, Activity,
  GitBranch, AudioWaveform, Users, Smartphone,
  FlaskConical, Wrench
} from 'lucide-react';
import { SECTIONS, SEARCH_INDEX } from '../../utils/constants';
import Fuse from 'fuse.js';

const ICON_MAP = {
  Waves, Radio, Zap, TrendingDown, Activity,
  GitBranch, AudioWaveform, Users, Smartphone,
  FlaskConical, Wrench
};

const fuse = new Fuse(SEARCH_INDEX, {
  keys: ['title', 'section'],
  threshold: 0.4,
});

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(fuse.search(searchQuery).slice(0, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut: Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'oklch(0.13 0.015 260 / 0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid oklch(1 0 0 / 0.06)' : 'none',
        }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-violet))',
                }}
              >
                <Waves size={20} color="white" />
              </div>
              <span className="font-bold text-lg hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
                Wireless<span className="gradient-text"> Visualized</span>
              </span>
            </Link>

            {/* Desktop Nav (collapsed - shows key sections) */}
            <div className="hidden lg:flex items-center gap-1">
              {SECTIONS.slice(0, 6).map((section) => {
                const Icon = ICON_MAP[section.icon] || Waves;
                const isActive = location.pathname.startsWith(section.path);

                return (
                  <div
                    key={section.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(section.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      to={section.path}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all no-underline"
                      style={{
                        color: isActive ? 'var(--color-accent-teal)' : 'var(--color-text-secondary)',
                        background: isActive ? 'oklch(0.75 0.15 185 / 0.1)' : 'transparent',
                      }}
                    >
                      <Icon size={15} />
                      <span>{section.title}</span>
                      <ChevronDown size={12} className="opacity-50" />
                    </Link>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === section.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 py-2 rounded-xl min-w-[220px]"
                          style={{
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-subtle)',
                            boxShadow: 'var(--shadow-elevated)',
                          }}
                        >
                          {section.topics.map((topic) => (
                            <Link
                              key={topic.id}
                              to={topic.path}
                              className="block px-4 py-2 text-sm transition-colors no-underline"
                              style={{
                                color: location.pathname === topic.path
                                  ? 'var(--color-accent-teal)'
                                  : 'var(--color-text-secondary)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              {topic.title}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* More dropdown for remaining sections */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border-none bg-transparent"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  More
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'more' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full right-0 mt-1 py-2 rounded-xl min-w-[220px]"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                        boxShadow: 'var(--shadow-elevated)',
                      }}
                    >
                      {SECTIONS.slice(6).map((section) => {
                        const Icon = ICON_MAP[section.icon] || Waves;
                        return (
                          <Link
                            key={section.id}
                            to={section.path}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm no-underline transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <Icon size={16} />
                            {section.title}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer border transition-colors"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <Search size={14} />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden md:inline text-xs px-1.5 py-0.5 rounded"
                     style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-tertiary)' }}>
                  ⌘K
                </kbd>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg cursor-pointer border-none bg-transparent"
                style={{ color: 'var(--color-text-primary)' }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
            style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: '0 25px 50px oklch(0 0 0 / 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4"
                   style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <Search size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search topics, equations, concepts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-base"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                <kbd className="text-xs px-2 py-1 rounded"
                     style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}>
                  ESC
                </kbd>
              </div>

              {searchResults.length > 0 && (
                <div className="p-2 max-h-80 overflow-y-auto">
                  {searchResults.map(({ item }) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 p-3 rounded-lg no-underline transition-colors"
                      style={{ color: 'var(--color-text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.sectionColor }} />
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.section}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="p-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  No results found for "{searchQuery}"
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-16 right-0 bottom-0 w-80 max-w-[85vw] z-40 overflow-y-auto"
            style={{
              background: 'var(--color-bg-secondary)',
              borderLeft: '1px solid var(--color-border-subtle)',
            }}
          >
            <div className="p-4 space-y-1">
              {SECTIONS.map((section) => {
                const Icon = ICON_MAP[section.icon] || Waves;
                return (
                  <div key={section.id}>
                    <Link
                      to={section.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Icon size={18} style={{ color: section.color }} />
                      {section.title}
                    </Link>
                    <div className="ml-10 space-y-0.5">
                      {section.topics.map((topic) => (
                        <Link
                          key={topic.id}
                          to={topic.path}
                          className="block px-3 py-1.5 rounded text-xs no-underline transition-colors"
                          style={{
                            color: location.pathname === topic.path
                              ? 'var(--color-accent-teal)'
                              : 'var(--color-text-tertiary)',
                          }}
                        >
                          {topic.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
