import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { X, Radio } from 'lucide-react';
import { EM_BANDS, TECH_MARKERS } from '../../utils/constants';
import { InfoCallout } from '../../components/interactive/ParameterPanel';

function SpectrumStrip({ onBandClick, selectedBand }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((e) => setWidth(e[0].contentRect.width));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const height = 180;
  const m = { top: 30, right: 20, bottom: 50, left: 20 };
  const iW = width - m.left - m.right;
  const iH = height - m.top - m.bottom;
  const fScale = useMemo(() => d3.scaleLog().domain([3e3, 300e9]).range([0, iW]), [iW]);
  const mult = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 };

  const bands = useMemo(() => EM_BANDS.map((b) => {
    const s = b.range[0] * mult[b.unit], e = b.range[1] * mult[b.unit];
    const x = fScale(Math.max(s, 3e3)), w = fScale(Math.min(e, 300e9)) - x;
    return { ...b, startHz: s, endHz: e, x, width: w };
  }).filter((b) => b.width > 0), [fScale]);

  const markers = useMemo(() => TECH_MARKERS.map((m) => ({ ...m, x: fScale(m.freq) })).filter((m) => m.x >= 0 && m.x <= iW), [fScale, iW]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height}>
        <g transform={`translate(${m.left},${m.top})`}>
          {bands.map((b) => (
            <g key={b.name} style={{ cursor: 'pointer' }} onClick={() => onBandClick(b)}>
              <rect x={b.x} y={0} width={b.width} height={iH} fill={b.color}
                    opacity={selectedBand?.name === b.name ? 0.6 : 0.25} rx={2} />
              {selectedBand?.name === b.name && <rect x={b.x} y={0} width={b.width} height={iH} fill="none" stroke={b.color} strokeWidth={2} rx={2} />}
              {b.width > 30 && <text x={b.x + b.width / 2} y={iH / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={b.width > 50 ? 11 : 9} fontWeight={600} fontFamily="var(--font-sans)">{b.name}</text>}
            </g>
          ))}
          {markers.map((mk) => (
            <g key={mk.name}>
              <line x1={mk.x} x2={mk.x} y1={-8} y2={iH + 8} stroke={mk.color} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.8} />
              <text x={mk.x} y={iH + 22} textAnchor="middle" fill={mk.color} fontSize={9} fontWeight={500} fontFamily="var(--font-sans)">{mk.name}</text>
            </g>
          ))}
          <g transform={`translate(0,${iH})`}>
            <line x1={0} x2={iW} stroke="oklch(1 0 0 / 0.2)" />
            {[1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11].map((f) => {
              const x = fScale(f);
              if (x < 0 || x > iW) return null;
              const l = { [1e4]: '10kHz', [1e5]: '100kHz', [1e6]: '1MHz', [1e7]: '10MHz', [1e8]: '100MHz', [1e9]: '1GHz', [1e10]: '10GHz', [1e11]: '100GHz' };
              return <g key={f} transform={`translate(${x},0)`}><line y2={5} stroke="oklch(1 0 0 / 0.3)" /><text y={38} textAnchor="middle" fill="var(--color-text-tertiary)" fontSize={9} fontFamily="var(--font-sans)">{l[f]}</text></g>;
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function EMSpectrum() {
  const [selectedBand, setSelectedBand] = useState(null);
  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>1.2 · Fundamentals</span>
        </div>
        <h1 className="mb-3">The Electromagnetic Spectrum</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Wireless communications occupy a tiny slice of the vast electromagnetic spectrum. Click on any band to learn about its applications.
        </p>
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-tertiary)' }}>Click a band · Dashed lines show common technologies</h3>
          <SpectrumStrip onBandClick={(b) => setSelectedBand(selectedBand?.name === b.name ? null : b)} selectedBand={selectedBand} />
        </div>
        <AnimatePresence>
          {selectedBand && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-card p-6 mb-6 relative">
              <button onClick={() => setSelectedBand(null)} className="absolute top-3 right-3 p-1 rounded-lg cursor-pointer border-none bg-transparent" style={{ color: 'var(--color-text-tertiary)' }}><X size={18} /></button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklch, ${selectedBand.color} 20%, transparent)` }}><Radio size={20} style={{ color: selectedBand.color }} /></div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: selectedBand.color }}>{selectedBand.name} — {selectedBand.label} Frequency</h3>
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{selectedBand.range[0]} – {selectedBand.range[1]} {selectedBand.unit}</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Applications</h4>
              <div className="flex flex-wrap gap-2">{selectedBand.apps.map((a) => <span key={a} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: `color-mix(in oklch, ${selectedBand.color} 10%, var(--color-bg-tertiary))`, color: selectedBand.color }}>{a}</span>)}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="info" title="WiFi & Your Microwave">Your WiFi uses 2.4 GHz — the same frequency as microwave ovens! Both excite water molecules, but your router uses milliwatts while the oven uses ~1000 watts.</InfoCallout>
          <InfoCallout type="tip" title="Why Not Visible Light?">Radio waves (lower frequency) diffract around obstacles, making them ideal for wireless coverage. Visible light can't penetrate walls.</InfoCallout>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold mb-4">Key Technologies & Frequencies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><th className="text-left py-3 pr-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Technology</th><th className="text-left py-3 pr-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Frequency</th><th className="text-left py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Wavelength</th></tr></thead>
              <tbody>{[{ t: 'AM Radio', f: '540–1600 kHz', w: '186–556 m' }, { t: 'FM Radio', f: '88–108 MHz', w: '2.8–3.4 m' }, { t: 'GPS', f: '1.575 GHz', w: '19 cm' }, { t: '4G LTE', f: '700 MHz – 2.6 GHz', w: '12–43 cm' }, { t: 'WiFi 2.4', f: '2.4 GHz', w: '12.5 cm' }, { t: '5G Sub-6', f: '3.5 GHz', w: '8.6 cm' }, { t: '5G mmWave', f: '24–47 GHz', w: '6–12 mm' }].map((r) => <tr key={r.t} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}><td className="py-3 pr-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.t}</td><td className="py-3 pr-4 font-mono text-xs" style={{ color: 'var(--color-accent-teal)' }}>{r.f}</td><td className="py-3 font-mono text-xs" style={{ color: 'var(--color-accent-amber)' }}>{r.w}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
