import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { InlineMath } from 'react-katex';
import { LineChart } from '../../components/charts/LineChart';
import { besselI0 } from '../../utils/wireless-math';

export default function RayleighRicean() {
  const [kFactorDb, setKFactorDb] = useState(0); // dB
  const [sigma, setSigma] = useState(1); // Multipath scale parameter

  // K factor in linear scale
  // K = A^2 / (2 * sigma^2) => A = sqrt(K * 2 * sigma^2)
  // But wait, K is ratio of LOS power to scattered power.
  // If K = 0 (linear), it's Rayleigh.
  // We'll allow K to be -20 dB to 20 dB. -20 dB is basically Rayleigh.
  const kLinear = Math.pow(10, kFactorDb / 10);
  
  // A is the peak amplitude of the dominant LOS signal
  const A = Math.sqrt(kLinear * 2 * sigma * sigma);

  const chartData = useMemo(() => {
    const riceanPdf = [];
    const rayleighPdf = [];
    
    // Evaluate PDF from r = 0 to r = 6
    for (let r = 0; r <= 6; r += 0.05) {
      // Rayleigh PDF: p(r) = (r / sigma^2) * exp(-r^2 / (2 * sigma^2))
      const pRayleigh = (r / (sigma * sigma)) * Math.exp(-(r * r) / (2 * sigma * sigma));
      rayleighPdf.push({ x: r, y: pRayleigh });

      // Ricean PDF: p(r) = (r / sigma^2) * exp(-(r^2 + A^2) / (2 * sigma^2)) * I0(r * A / sigma^2)
      // To prevent overflow with large K (large A), we need a stable I0 * exp formulation, 
      // but for visualization A is moderate enough (up to K=100 -> A=14, arg=84)
      const arg = (r * A) / (sigma * sigma);
      const expPart = Math.exp(-(r * r + A * A) / (2 * sigma * sigma));
      const pRicean = (r / (sigma * sigma)) * expPart * besselI0(arg);
      
      // Safety check for NaN
      riceanPdf.push({ x: r, y: isNaN(pRicean) ? 0 : pRicean });
    }

    return [
      { label: `Ricean (K=${kFactorDb} dB)`, color: '#10b981', data: riceanPdf },
      { label: 'Rayleigh (Reference)', color: '#64748b', data: rayleighPdf }
    ];
  }, [kFactorDb, sigma, A]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
          <span className="text-sm font-medium" style={{ color: '#10b981' }}>5.4 · Small-Scale Fading</span>
        </div>
        <h1 className="mb-3">Rayleigh vs Ricean Fading</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          The statistical distribution of the received signal envelope depends on whether there is a dominant 
          Line-Of-Sight (LOS) path or just a large number of random scattered paths.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Ricean K-Factor (dB)" 
                value={kFactorDb} min={-20} max={20} step={1}
                onChange={setKFactorDb} 
                color="var(--color-accent-green)"
                description="The ratio of power in the direct Line-Of-Sight path compared to all the scattered paths. A high K-factor means a very stable connection (like satellite TV)."
              />
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Scattering Spread (σ)" 
                  value={sigma} min={0.5} max={2} step={0.1}
                  onChange={setSigma} 
                  description="Determines how widely the signal amplitude fluctuates when there is no dominant path."
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>LOS Peak Amplitude (<InlineMath math="A" />)</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {A.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Probability Density Function of Signal Envelope</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Received Envelope Amplitude (r)"
                yLabel="Probability Density p(r)"
                xScale="linear"
                yScale="linear"
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Notice how increasing the K-factor shifts the Ricean distribution to look more like a Gaussian bell curve 
              centered around the LOS amplitude.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <EquationCard 
            title="Rayleigh Distribution" 
            math="p(r) = \frac{r}{\sigma^2} e^{-\frac{r^2}{2\sigma^2}}" 
            description="Occurs when there is NO dominant line-of-sight path (e.g. dense urban environment). It's the envelope of two independent Gaussian random variables." 
          />
          <EquationCard 
            title="Ricean Distribution" 
            math="p(r) = \frac{r}{\sigma^2} e^{-\frac{r^2 + A^2}{2\sigma^2}} I_0\left(\frac{rA}{\sigma^2}\right)" 
            description="Occurs when there is a strong dominant LOS path (A) plus many weaker scattered paths." 
          />
        </div>
        
        <InfoCallout type="aha" title="What does the K-factor physically mean?">
          <InlineMath math="K = A^2 / (2\sigma^2)" /> — literally the ratio of power in the direct LOS path to the total
          scattered power. A high K-factor means a very stable connection (like satellite TV). K&nbsp;=&nbsp;0 (linear)
          means a wildly fluctuating connection (like your phone deep inside a building).
        </InfoCallout>

        {/* Practical K-factor reference */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-base font-semibold mb-4">Practical K-Factor Reference</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">Environment</th>
                  <th className="text-left py-2 pr-4 text-white/50 font-medium">Typical K (dB)</th>
                  <th className="text-left py-2 text-white/50 font-medium">Fading Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { env: 'GEO Satellite link (clear sky)', k: '> 15 dB', severity: 'Very mild — near AWGN', color: '#10b981' },
                  { env: 'Indoor office with visible AP', k: '6–10 dB', severity: 'Mild (Ricean)', color: '#06b6d4' },
                  { env: 'Suburban outdoor (low rise)', k: '0–6 dB', severity: 'Moderate', color: '#f59e0b' },
                  { env: 'Urban street level (NLOS)', k: '–5 to 0 dB', severity: 'Severe (near Rayleigh)', color: '#ef4444' },
                  { env: 'Dense urban / deep indoor', k: '→ –∞ (Rayleigh)', severity: 'Worst case', color: '#ef4444' },
                ].map((row) => (
                  <tr key={row.env}>
                    <td className="py-2.5 pr-4 text-white/80">{row.env}</td>
                    <td className="py-2.5 pr-4 font-mono font-semibold" style={{ color: row.color }}>{row.k}</td>
                    <td className="py-2.5 text-white/60">{row.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
