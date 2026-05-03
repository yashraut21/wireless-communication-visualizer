import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { hataUrban, hataSuburban, hataOpen, fsplDb } from '../../utils/wireless-math';

const ENVIRONMENTS = [
  { id: 'urban', label: 'Urban (Large City)', color: '#ef4444' },
  { id: 'suburban', label: 'Suburban', color: '#f59e0b' },
  { id: 'open', label: 'Open / Rural', color: '#10b981' }
];

export default function OkumuraHata() {
  const [freqMHz, setFreqMHz] = useState(900);
  const [ht, setHt] = useState(50); // Tx height
  const [hr, setHr] = useState(1.5); // Rx height
  const [distanceKm, setDistanceKm] = useState(5);

  const chartData = useMemo(() => {
    const dataUrban = [];
    const dataSuburban = [];
    const dataOpen = [];
    const dataFspl = [];
    
    // Okumura-Hata is valid from 1km to 20km
    for (let d = 1; d <= 20; d += 0.5) {
      dataUrban.push({ x: d, y: hataUrban(freqMHz, ht, hr, d) });
      dataSuburban.push({ x: d, y: hataSuburban(freqMHz, ht, hr, d) });
      dataOpen.push({ x: d, y: hataOpen(freqMHz, ht, hr, d) });
      dataFspl.push({ x: d, y: fsplDb(d * 1000, freqMHz * 1e6) });
    }

    return [
      { label: 'Urban', color: '#ef4444', data: dataUrban },
      { label: 'Suburban', color: '#f59e0b', data: dataSuburban },
      { label: 'Open / Rural', color: '#10b981', data: dataOpen },
      { label: 'Free Space (Reference)', color: '#64748b', data: dataFspl }
    ];
  }, [freqMHz, ht, hr]);

  const markers = [
    { x: distanceKm, label: `${distanceKm.toFixed(1)} km`, color: 'var(--color-text-secondary)' }
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>4.3 · Large-Scale Fading</span>
        </div>
        <h1 className="mb-3">Okumura-Hata Model</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          The Okumura-Hata model is an empirical formulation based on extensive field measurements in Tokyo. 
          It provides a standard formula to predict path loss across different terrain types.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Carrier Frequency (MHz)" 
                value={freqMHz} min={150} max={1500} step={50}
                onChange={setFreqMHz} 
                description="The standard model is only valid up to 1.5 GHz. Note that increasing frequency increases path loss uniformly across all environments."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="BS Antenna Height, ht (m)" 
                  value={ht} min={30} max={200} step={10}
                  onChange={setHt} 
                  color="var(--color-accent-blue)"
                  description="A taller base station clears more buildings and obstacles, significantly reducing path loss across the entire cell."
                />
              </div>

              <div className="mt-4">
                <ParameterSlider 
                  label="MS Antenna Height, hr (m)" 
                  value={hr} min={1} max={10} step={1}
                  onChange={setHr} 
                  color="var(--color-accent-violet)"
                  description="Mobile station (user) height. Raising this helps slightly, but the base station height is the dominant factor in cell design."
                />
              </div>

              <div className="mt-4">
                <ParameterSlider 
                  label="Analysis Distance (km)" 
                  value={distanceKm} min={1} max={20} step={1}
                  onChange={setDistanceKm} 
                  color="var(--color-text-secondary)"
                  description="The distance from the base station. The empirical curves accurately capture the complex combination of free space loss, reflections, and diffractions."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Path Loss at {distanceKm} km</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Urban:</span>
                  <span className="font-mono font-bold text-[#ef4444]">{hataUrban(freqMHz, ht, hr, distanceKm).toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Suburban:</span>
                  <span className="font-mono font-bold text-[#f59e0b]">{hataSuburban(freqMHz, ht, hr, distanceKm).toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Open:</span>
                  <span className="font-mono font-bold text-[#10b981]">{hataOpen(freqMHz, ht, hr, distanceKm).toFixed(1)} dB</span>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Validity Range" 
              math="150 \le f_c \le 1500 \text{ MHz}" 
              description="The standard model is only valid up to 1.5 GHz and 20 km. The COST-231 Hata model extends this to 2 GHz." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Empirical Path Loss vs Distance</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Distance (km)"
                yLabel="Path Loss (dB)"
                xScale="linear"
                yScale="linear"
                markers={markers}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Notice how much higher the loss is in Urban environments compared to Free Space (reference).
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="Empirical vs Deterministic Models">
            Models like Two-Ray or Ray Tracing are <em>deterministic</em> — they use geometry and physics. 
            Models like Okumura-Hata are <em>empirical</em> — they are essentially curve-fitting equations derived 
            from millions of actual measurements. Empirical models are fast and practically useful for planning.
          </InfoCallout>
          
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-3">Correction Factors</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              The model starts with a complex formula for a standard Urban area. Then, it subtracts specific 
              correction factors depending on the environment:
            </p>
            <ul className="text-sm mt-3 space-y-1 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Suburban:</strong> Subtracts ~10 dB from Urban</li>
              <li><strong>Open/Rural:</strong> Subtracts ~25-30 dB from Urban</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
