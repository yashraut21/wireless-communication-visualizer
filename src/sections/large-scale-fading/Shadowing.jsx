import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';
import { qFunction } from '../../utils/wireless-math';

export default function Shadowing() {
  const [stdDevDb, setStdDevDb] = useState(8);
  const [fadeMarginDb, setFadeMarginDb] = useState(10); // Margin above sensitivity

  // Normal PDF calculation
  const normalPdf = (x, mu, sigma) => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  const chartData = useMemo(() => {
    const dataPdf = [];
    const dataShaded = [];
    
    // x represents the deviation from mean path loss in dB
    // We want to see what probability the signal is ABOVE the threshold.
    // Let's plot the received power variation relative to the mean.
    // Mean received power variation = 0 dB.
    // The threshold is at -fadeMarginDb.
    for (let x = -30; x <= 30; x += 0.5) {
      const y = normalPdf(x, 0, stdDevDb);
      dataPdf.push({ x, y });
      
      // If signal is above the threshold (i.e., variation > -margin), it's successful
      if (x >= -fadeMarginDb) {
        dataShaded.push({ x, y });
      } else {
        dataShaded.push({ x, y: 0 }); // for visual shading area trick
      }
    }

    return [
      { label: 'Coverage Area', color: '#10b981', data: dataShaded },
      { label: 'Received Power PDF', color: '#06b6d4', data: dataPdf }
    ];
  }, [stdDevDb, fadeMarginDb]);

  // Probability of coverage at cell edge
  // We need P(Pr > Pr_min). Pr = Pr_mean + X.
  // P(X > Pr_min - Pr_mean) = P(X > -fadeMargin) = P(X/sigma > -margin/sigma) = Q(-margin/sigma)
  const edgeCoverageProb = 1 - qFunction(fadeMarginDb / stdDevDb);
  
  // Overall Area Coverage Probability (approximate formula by Jakes)
  // U(y) = 0.5 * (1 - erf(a) + exp((2*a*b + 1)/b^2) * (1 - erf((a*b+1)/b)))
  // Let's use the exact numerical or a simplified form. 
  // Actually, standard formula: U = 0.5 * (1 + erf(a)) + 0.5 * exp(2ab+b^2) * (1 - erf(a+b))
  // a = (fadeMarginDb) / (stdDevDb * sqrt(2)), b = 10 * n * log10(e) / (stdDevDb * sqrt(2)).
  // Let's just use a simpler approximation or just focus on Edge Coverage for the UI to avoid confusing the user.
  
  const markers = [
    { x: -fadeMarginDb, label: 'Sensitivity Threshold', color: 'var(--color-accent-red)' },
    { x: 0, label: 'Mean Power', color: 'var(--color-text-secondary)' }
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>4.4 · Large-Scale Fading</span>
        </div>
        <h1 className="mb-3">Log-Normal Shadowing</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Even at the exact same distance from a cell tower, the signal strength varies drastically 
          depending on whether you are behind a building, a hill, or in an open street. This variation 
          is called shadowing.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Standard Deviation, σ (dB)" 
                value={stdDevDb} min={2} max={14} step={1}
                onChange={setStdDevDb} 
                color="var(--color-accent-blue)"
                description="How much the signal varies around the mean. A dense city with tall buildings has a high standard deviation (8-10 dB)."
              />
              <div className="text-xs mt-1 mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                Typical: 8 dB (urban), 6 dB (suburban)
              </div>
              
              <div className="mt-4">
                <ParameterSlider 
                  label="Fade Margin (dB)" 
                  value={fadeMarginDb} min={0} max={20} step={1}
                  onChange={setFadeMarginDb} 
                  color="var(--color-accent-amber)"
                  description="The extra transmit power you budget into the system link design specifically to overcome these shadowing dips."
                />
              </div>
              <div className="text-xs mt-1 mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                Extra power planned above the receiver sensitivity.
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <div className="text-sm mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Edge Coverage Probability</div>
                <div className="font-mono text-4xl font-bold" style={{ color: edgeCoverageProb > 0.9 ? 'var(--color-accent-green)' : 'var(--color-accent-amber)' }}>
                  {(edgeCoverageProb * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Coverage Probability" 
              math="P(P_r > P_{min}) = Q\left(\frac{P_{min} - \overline{P_r}}{\sigma}\right)" 
              description="Calculated using the Q-function (tail probability of the normal distribution)." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Received Power Distribution at Cell Edge</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Variation from Mean Power (dB)"
                yLabel="Probability Density"
                xScale="linear"
                yScale="linear"
                xDomain={[-30, 30]}
                markers={markers}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              The green area represents the probability that the signal is strong enough to maintain a connection.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCallout type="aha" title="Why is it called Log-Normal?">
            When a signal travels through a dense city, it gets attenuated by multiple obstacles one after another. 
            In linear scale, these losses multiply. Taking the logarithm converts this multiplication into addition. 
            By the Central Limit Theorem, the sum of many random losses becomes normally distributed (Gaussian) in dB!
          </InfoCallout>
          
          <InfoCallout type="warning" title="Cell Edge vs Cell Area">
            90% coverage at the <em>cell edge</em> usually translates to around 95-97% coverage across the 
            <em>entire cell area</em>, because users closer to the tower have a much higher signal strength and 
            are extremely unlikely to drop the call due to shadowing.
          </InfoCallout>
        </div>
      </motion.div>
    </div>
  );
}
