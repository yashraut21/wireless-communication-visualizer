import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { BarChart } from '../../components/charts/BarChart';
import { rmsDelaySpread } from '../../utils/wireless-math';

const INITIAL_TAPS = [
  { id: 1, delay: 0, powerDb: 0 },
  { id: 2, delay: 1, powerDb: -5 },
  { id: 3, delay: 2, powerDb: -10 },
  { id: 4, delay: 4, powerDb: -20 },
];

export default function PowerDelayProfile() {
  const [taps, setTaps] = useState(INITIAL_TAPS);

  // Helper to convert dB to linear power for calculations
  const dbToLinear = (db) => Math.pow(10, db / 10);
  const linearToDb = (lin) => 10 * Math.log10(lin);

  const stats = useMemo(() => {
    // taps with linear power
    const linearTaps = taps.map(t => ({
      delay: t.delay * 1e-6, // Assuming delay in microseconds
      power: dbToLinear(t.powerDb)
    }));
    
    const rms = rmsDelaySpread(linearTaps);
    
    const totalPower = linearTaps.reduce((sum, t) => sum + t.power, 0);
    const meanDelay = linearTaps.reduce((sum, t) => sum + t.delay * t.power, 0) / totalPower;
    
    return {
      rmsSpreadUs: rms * 1e6,
      meanDelayUs: meanDelay * 1e6
    };
  }, [taps]);

  const chartData = useMemo(() => {
    // For the bar chart, we want to plot power in linear scale (normalized) or dB.
    // Usually PDP is plotted with linear power to show the "spread" intuitively.
    return taps.map(t => ({
      x: t.delay,
      y: dbToLinear(t.powerDb),
      label: `${t.powerDb} dB`,
      color: 'var(--color-accent-teal)'
    })).sort((a, b) => a.x - b.x);
  }, [taps]);

  const updateTap = (id, field, value) => {
    setTaps(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTap = () => {
    const maxId = Math.max(...taps.map(t => t.id));
    const maxDelay = Math.max(...taps.map(t => t.delay));
    setTaps([...taps, { id: maxId + 1, delay: maxDelay + 1, powerDb: -15 }]);
  };

  const removeTap = (id) => {
    if (taps.length <= 1) return; // Keep at least one tap
    setTaps(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>5.1 · Small-Scale Fading</span>
        </div>
        <h1 className="mb-3">Power Delay Profile (PDP)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          A single transmitted pulse arrives at the receiver as multiple pulses at different times 
          due to reflections. The Power Delay Profile shows the intensity of a signal received through 
          a multipath channel as a function of time delay.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Multipath Taps</h3>
                <button onClick={addTap} className="px-3 py-1 text-xs rounded bg-[#14b8a6]/20 text-[#14b8a6] hover:bg-[#14b8a6]/30 transition-colors">
                  + Add Tap
                </button>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {taps.map((tap, index) => (
                  <div key={tap.id} className="p-3 rounded-lg border border-white/10" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Tap {index + 1}</span>
                      <button onClick={() => removeTap(tap.id)} disabled={taps.length <= 1} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Remove</button>
                    </div>
                    <ParameterSlider 
                      label="Delay (μs)" 
                      value={tap.delay} min={0} max={10} step={0.5}
                      onChange={(v) => updateTap(tap.id, 'delay', v)} 
                      color="var(--color-accent-blue)"
                      description="The time delay relative to the first arriving signal. 1 microsecond delay means the wave traveled ~300 meters further."
                    />
                    <div className="mt-2">
                      <ParameterSlider 
                        label="Relative Power (dB)" 
                        value={tap.powerDb} min={-40} max={0} step={1}
                        onChange={(v) => updateTap(tap.id, 'powerDb', v)} 
                        color="var(--color-accent-teal)"
                        description="The power of this specific echo compared to the strongest path (0 dB)."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Mean Excess Delay (<Equation math="\overline{\tau}" />)</div>
                  <div className="font-mono font-bold text-white">{stats.meanDelayUs.toFixed(2)} μs</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>RMS Delay Spread (<Equation math="\sigma_\tau" />)</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-amber)' }}>{stats.rmsSpreadUs.toFixed(2)} μs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Multipath Power vs Excess Delay</h3>
            <div className="flex-1 min-h-[400px]">
              <BarChart 
                data={chartData}
                xLabel="Excess Delay (μs)"
                yLabel="Relative Power (Linear Scale)"
                xDomain={[0, Math.max(10, ...taps.map(t => t.delay)) + 1]}
                yDomain={[0, 1.1]} // max relative linear power is 1
                barWidth={10}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Note: The graph shows linear power (not dB) to accurately represent how much energy arrives at each delay.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <EquationCard 
            title="Mean Excess Delay" 
            math="\overline{\tau} = \frac{\sum P(\tau_k) \tau_k}{\sum P(\tau_k)}" 
            description="The power-weighted average delay of the multipath components." 
          />
          <EquationCard 
            title="RMS Delay Spread" 
            math="\sigma_\tau = \sqrt{\overline{\tau^2} - (\overline{\tau})^2}" 
            description="The standard deviation of the delay. This is the single most important metric for time dispersion." 
          />
        </div>
      </motion.div>
    </div>
  );
}
