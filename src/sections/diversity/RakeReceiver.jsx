import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { BarChart } from '../../components/charts/BarChart';

const INITIAL_TAPS = [
  { delay: 0, powerDb: 0 },
  { delay: 1, powerDb: -3 },
  { delay: 2, powerDb: -15 },
  { delay: 3, powerDb: -8 },
  { delay: 4, powerDb: -22 },
  { delay: 5, powerDb: -12 },
  { delay: 7, powerDb: -18 },
];

export default function RakeReceiver() {
  const [numFingers, setNumFingers] = useState(3);
  const [thresholdDb, setThresholdDb] = useState(-15);
  
  const chartData = useMemo(() => {
    // A rake receiver looks at the PDP, filters out taps below the threshold,
    // and assigns its limited fingers to the strongest remaining taps.
    const sortedTaps = [...INITIAL_TAPS].sort((a, b) => b.powerDb - a.powerDb);
    
    // Assign fingers
    let fingersAssigned = 0;
    const assignedTaps = new Set();
    
    for (const tap of sortedTaps) {
      if (tap.powerDb >= thresholdDb && fingersAssigned < numFingers) {
        assignedTaps.add(tap.delay);
        fingersAssigned++;
      }
    }
    
    // Convert to linear power for display
    const dbToLinear = (db) => Math.pow(10, db / 10);
    
    let capturedPowerLinear = 0;
    let totalPowerLinear = 0;
    
    const data = INITIAL_TAPS.map(tap => {
      const isCaptured = assignedTaps.has(tap.delay);
      const lin = dbToLinear(tap.powerDb);
      totalPowerLinear += lin;
      if (isCaptured) capturedPowerLinear += lin;
      
      return {
        x: tap.delay,
        y: lin,
        label: `${tap.powerDb} dB`,
        color: isCaptured ? '#8b5cf6' : '#64748b',
        isCaptured
      };
    }).sort((a, b) => a.x - b.x);
    
    const percentCaptured = (capturedPowerLinear / totalPowerLinear) * 100;
    
    return { data, percentCaptured };
  }, [numFingers, thresholdDb]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>6.3 · Diversity</span>
        </div>
        <h1 className="mb-3">Rake Receiver</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          In wideband systems like CDMA, the signal bandwidth is so wide that it can individually resolve 
          delayed multipath echoes. Instead of treating these echoes as interference, a Rake receiver uses 
          multiple correlators ("fingers") to capture and constructively combine them!
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Number of Rake Fingers" 
                value={numFingers} min={1} max={6} step={1}
                onChange={setNumFingers} 
                color="var(--color-accent-violet)"
                description="The hardware limit on how many separate delayed paths the receiver can simultaneously track and combine."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Capture Threshold (dB)" 
                  value={thresholdDb} min={-30} max={0} step={1}
                  onChange={setThresholdDb} 
                  color="var(--color-text-tertiary)"
                  description="Echoes weaker than this threshold are ignored as noise."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Energy Captured</div>
                  <div className="font-mono text-xl font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {chartData.percentCaptured.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Time Diversity" 
              math="y(t) = \sum_{k=1}^F w_k \cdot r(t - \tau_k)" 
              description="The receiver aligns F delayed copies and weights them (usually using Maximal Ratio Combining) to form a stronger signal." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Power Delay Profile & Finger Allocation</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[#8b5cf6]" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Captured by Finger</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[#64748b]" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Ignored / Missed</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[400px]">
              <BarChart 
                data={chartData.data}
                xLabel="Delay (Chips / μs)"
                yLabel="Relative Power (Linear)"
                xDomain={[0, 8]}
                yDomain={[0, 1.1]}
                barWidth={12}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              A Rake receiver literally "rakes" the energy from the multipath environment.
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="Turning a Problem into a Feature">
          In narrowband systems, multipath delay causes Frequency Selective Fading, which destroys the signal. 
          But in wideband Spread Spectrum systems (like 3G), the delay spread is actually beneficial! The Rake receiver provides <em>built-in</em> path diversity without needing multiple physical antennas.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
