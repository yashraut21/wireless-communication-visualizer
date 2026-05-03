import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

export default function DiversityConcept() {
  const [numAntennas, setNumAntennas] = useState(2);
  
  const chartData = useMemo(() => {
    // Plot outage probability vs Fade Margin (dB)
    // P_out = (1 - exp(-10^(-Margin/10)))^M
    const data = [];
    const referenceData = [];
    
    for (let marginDb = 0; marginDb <= 30; marginDb += 1) {
      const marginLinear = Math.pow(10, -marginDb / 10);
      
      // Single antenna (reference)
      const pOut1 = 1 - Math.exp(-marginLinear);
      referenceData.push({ x: marginDb, y: pOut1 });
      
      // M antennas
      const pOutM = Math.pow(1 - Math.exp(-marginLinear), numAntennas);
      data.push({ x: marginDb, y: pOutM });
    }
    
    return [
      { label: `M = ${numAntennas} Antennas`, color: '#06b6d4', data: data },
      { label: 'Single Antenna (M=1)', color: '#64748b', data: referenceData }
    ];
  }, [numAntennas]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>6.1 · Diversity</span>
        </div>
        <h1 className="mb-3">The Concept of Diversity</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Fading is highly localized in space, time, and frequency. If we provide the receiver with multiple independent copies of the signal, the probability that ALL of them are in a deep fade simultaneously drops exponentially!
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Number of Branches (M)" 
                value={numAntennas} min={1} max={8} step={1}
                onChange={setNumAntennas} 
                color="var(--color-accent-blue)"
                description="The number of independent signal paths (e.g., separate antennas spaced far apart)."
              />

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Outage Prob. at 20dB Margin</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {Math.pow(1 - Math.exp(-Math.pow(10, -20/10)), numAntennas).toExponential(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Outage Probability" 
              math="P_M(\gamma < \gamma_0) = (1 - e^{-\gamma_0/\Gamma})^M" 
              description="Where M is the number of branches, and γ_0/Γ is the fade margin." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Outage Probability vs Fade Margin (Log Scale)</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Fade Margin (dB)"
                yLabel="Probability of Deep Fade"
                xScale="linear"
                yScale="log"
                yDomain={[1e-8, 1]}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Notice how increasing M steepens the curve dramatically.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="Exponential Reliability">
            If one antenna has a 10% chance of being in a deep fade, two independent antennas have a 1% chance (0.1 × 0.1), and three have a 0.1% chance! This is why MIMO and diversity are essential in modern wireless.
          </InfoCallout>
          
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-3">Types of Diversity</h3>
            <ul className="text-sm space-y-2 list-disc pl-5" style={{ color: 'var(--color-text-secondary)' }}>
              <li><strong>Spatial:</strong> Multiple antennas separated by $&gt;\lambda/2$.</li>
              <li><strong>Frequency:</strong> Sending the same data on different frequencies separated by $&gt;B_c$.</li>
              <li><strong>Time:</strong> Interleaving data over time intervals separated by $&gt;T_c$.</li>
              <li><strong>Polarization:</strong> Horizontal and vertical antennas.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
