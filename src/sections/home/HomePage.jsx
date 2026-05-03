import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  Waves, Radio, Zap, TrendingDown, Activity, GitBranch,
  ArrowRight, BookOpen, Lightbulb, Rocket, ChevronRight
} from 'lucide-react';
import { SECTIONS } from '../../utils/constants';
import { useLearningStore } from '../../store/useLearningStore';

/* ---- 3D Hero Wave Animation ---- */
function HeroWaves() {
  const meshRef = useRef();
  const COUNT = 80;
  const SEG = 200;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const positions = meshRef.current.geometry.attributes.position;

    for (let i = 0; i <= SEG; i++) {
      const x = (i / SEG) * 20 - 10;
      for (let j = 0; j < 3; j++) {
        const freq = 1 + j * 0.5;
        const amp = 0.3 - j * 0.08;
        const y = amp * Math.sin(freq * x - t * 2 + j * 1.5);
        const idx = (i * 3 + j);
        if (idx < positions.count) {
          positions.setY(idx, y + (j - 1) * 1.2);
        }
      }
    }
    positions.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i <= SEG; i++) {
      const x = (i / SEG) * 20 - 10;
      for (let j = 0; j < 3; j++) {
        vertices.push(x, (j - 1) * 1.2, 0);
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#14b8a6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function HeroWaveLines() {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((line, lineIdx) => {
      const positions = line.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const freq = 0.8 + lineIdx * 0.3;
        const amp = 0.5 - lineIdx * 0.1;
        const y = amp * Math.sin(freq * x - t * 1.5 + lineIdx * 2);
        positions.setY(i, y);
      }
      positions.needsUpdate = true;
    });
  });

  const lines = useMemo(() => {
    return [0, 1, 2, 3, 4].map((idx) => {
      const points = [];
      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * 20 - 10;
        points.push(new THREE.Vector3(x, 0, idx * 0.8 - 2));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      return { geo, idx };
    });
  }, []);

  const colors = ['#14b8a6', '#06b6d4', '#8b5cf6', '#6366f1', '#3b82f6'];

  return (
    <group ref={ref}>
      {lines.map(({ geo, idx }) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial color={colors[idx]} transparent opacity={0.3 + idx * 0.05} />
        </line>
      ))}
    </group>
  );
}

/* ---- Learning Path Cards ---- */
const PATHS = [
  {
    id: 'beginner',
    icon: BookOpen,
    title: 'Beginner',
    description: 'Start from zero — understand waves, frequencies, and why we use decibels',
    color: '#14b8a6',
    topics: ['Waves', 'EM Spectrum', 'Decibels', 'Cellular Concept'],
  },
  {
    id: 'intermediate',
    icon: Lightbulb,
    title: 'Intermediate',
    description: 'Dive into propagation, fading models, and how signals behave in the real world',
    color: '#6366f1',
    topics: ['Propagation', 'Path Loss', 'Multipath', 'Diversity'],
  },
  {
    id: 'advanced',
    icon: Rocket,
    title: 'Advanced',
    description: 'Master modulation, CDMA, system design, and the engineer\'s toolkit',
    color: '#8b5cf6',
    topics: ['Modulation', 'Multiple Access', 'GSM', 'Link Budgets'],
  },
];

const SECTION_ICONS = { Waves, Radio, Zap, TrendingDown, Activity, GitBranch };

/* ---- Feature Section Cards ---- */
function SectionCard({ section, index }) {
  const Icon = SECTION_ICONS[section.icon] || Waves;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={section.path} className="no-underline">
        <div className="glass-card p-6 h-full group cursor-pointer">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style={{
              background: `color-mix(in oklch, ${section.color} 15%, transparent)`,
            }}
          >
            <Icon size={20} style={{ color: section.color }} />
          </div>

          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {section.title}
          </h3>

          <div className="space-y-1 mb-4">
            {section.topics.slice(0, 3).map((topic) => (
              <div key={topic.id} className="text-xs flex items-center gap-1.5"
                   style={{ color: 'var(--color-text-tertiary)' }}>
                <ChevronRight size={10} />
                {topic.title}
              </div>
            ))}
            {section.topics.length > 3 && (
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                +{section.topics.length - 3} more topics
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm font-medium"
               style={{ color: section.color }}>
            Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---- Stats Bar ---- */
function StatsBar() {
  const stats = [
    { label: 'Interactive Visualizations', value: '50+' },
    { label: 'Topics Covered', value: '40+' },
    { label: 'Real-Time Simulations', value: '15+' },
    { label: 'Engineering Tools', value: '10+' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="text-center p-4"
        >
          <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---- Main HomePage ---- */
export default function HomePage() {
  const { learningPath, setLearningPath } = useLearningStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-60">
          <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
            <ambientLight intensity={0.3} />
            <HeroWaveLines />
            <HeroWaves />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, oklch(0.13 0.015 260 / 0.8), oklch(0.13 0.03 280 / 0.6))',
          }}
        />

        {/* Hero content */}
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full pulse-glow" style={{ background: 'var(--color-accent-teal)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>
                Interactive Learning Platform
              </span>
            </div>

            <h1 className="mb-6" style={{ letterSpacing: '-0.03em' }}>
              <span style={{ color: 'var(--color-text-primary)' }}>Wireless Communications</span>
              <br />
              <span className="gradient-text">Visualized</span>
            </h1>

            <p className="text-lg mb-8 max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Transform abstract wireless concepts into intuitive, interactive experiences.
              Explore propagation, fading, antennas, modulation — and truly <em>see</em> how signals behave.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/fundamentals/waves"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold no-underline transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-blue))',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow-teal)',
                }}
              >
                Start Learning <ArrowRight size={18} />
              </Link>
              <Link
                to="/playground"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium no-underline transition-all glass-card"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Open Playground
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(to top, var(--color-bg-primary), transparent)',
          }}
        />
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="section-container">
          <StatsBar />
        </div>
      </section>

      {/* Learning Path Selector */}
      <section className="py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-3">Choose Your <span className="gradient-text">Learning Path</span></h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Whether you're just starting or looking to deepen your expertise, we have a track for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PATHS.map((path, i) => {
              const Icon = path.icon;
              const isActive = learningPath === path.id;

              return (
                <motion.button
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setLearningPath(path.id)}
                  className="text-left p-6 rounded-2xl cursor-pointer border-2 transition-all w-full"
                  style={{
                    background: isActive
                      ? `color-mix(in oklch, ${path.color} 8%, var(--color-bg-secondary))`
                      : 'var(--color-bg-secondary)',
                    borderColor: isActive ? path.color : 'var(--color-border-subtle)',
                    boxShadow: isActive ? `0 0 30px ${path.color}22` : 'none',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `color-mix(in oklch, ${path.color} 15%, transparent)`,
                    }}
                  >
                    <Icon size={24} style={{ color: path.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {path.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    {path.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {path.topics.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{
                          background: `color-mix(in oklch, ${path.color} 10%, transparent)`,
                          color: path.color,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="py-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-3">Explore <span className="gradient-text">All Topics</span></h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              11 comprehensive sections covering everything from basic wave theory to advanced system design.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SECTIONS.map((section, i) => (
              <SectionCard key={section.id} section={section} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, oklch(0.18 0.04 250 / 0.5), oklch(0.16 0.03 290 / 0.3))',
            }}
          >
            <h2 className="mb-4">Ready to <span className="gradient-text">See the Invisible?</span></h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Start with the fundamentals and build your way up to designing real wireless systems.
            </p>
            <Link
              to="/fundamentals/waves"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold no-underline transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent-teal), var(--color-accent-violet))',
                color: 'white',
                boxShadow: '0 0 40px oklch(0.75 0.15 185 / 0.2)',
              }}
            >
              Begin with "What is a Wave?" <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
