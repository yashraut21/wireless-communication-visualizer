import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

// Complementary Error Function (approx)
function erfc(x) {
  const z = Math.abs(x);
  const t = 1.0 / (1.0 + 0.5 * z);
  const ans = t * Math.exp(-z * z - 1.26551223 +
    t * (1.00002368 +
      t * (0.37409196 +
        t * (0.09678418 +
          t * (-0.18628806 +
            t * (0.27886807 +
              t * (-1.13520398 +
                t * (1.48851587 +
                  t * (-0.82215223 +
                    t * 0.17087277)))))))));
  return x >= 0 ? ans : 2.0 - ans;
}

// Combinations (n choose k)
function nCr(n, k) {
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
}

export default function BERinFading() {
  const [diversityM, setDiversityM] = useState(2);

  const chartData = useMemo(() => {
    const awgnData = [];
    const rayleighData = [];
    const diversityData = [];

    for (let snrDb = 0; snrDb <= 35; snrDb += 1) {
      const snrLinear = Math.pow(10, snrDb / 10);
      
      // AWGN BPSK BER
      const berAwgn = 0.5 * erfc(Math.sqrt(snrLinear));
      awgnData.push({ x: snrDb, y: Math.max(1e-6, berAwgn) });

      // Rayleigh Fading BPSK BER
      const mu = Math.sqrt(snrLinear / (1 + snrLinear));
      const berRayleigh = 0.5 * (1 - mu);
      rayleighData.push({ x: snrDb, y: Math.max(1e-6, berRayleigh) });

      // MRC Diversity BPSK BER
      let berDiversity = 0;
      const term1 = Math.pow((1 - mu) / 2, diversityM);
      let sum = 0;
      for (let k = 0; k < diversityM; k++) {
        sum += nCr(diversityM - 1 + k, k) * Math.pow((1 + mu) / 2, k);
      }
      berDiversity = term1 * sum;
      diversityData.push({ x: snrDb, y: Math.max(1e-6, berDiversity) });
    }

    return [
      { label: `MRC Diversity (M=${diversityM})`, color: '#ec4899', data: diversityData },
      { label: 'AWGN (Ideal, No Fading)', color: '#3b82f6', data: awgnData },
      { label: 'Rayleigh Fading (M=1)', color: '#f59e0b', data: rayleighData },
    ];
  }, [diversityM]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          <span className="text-sm font-medium" style={{ color: '#ef4444' }}>7.4 · Modulation</span>
        </div>
        <h1 className="mb-3">BER in Fading Channels</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          The ultimate metric for digital communication is Bit Error Rate (BER). See how fading completely destroys link reliability, and how Diversity rescues it.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Diversity Branches (M)" 
                value={diversityM} min={2} max={6} step={1}
                onChange={setDiversityM} 
                color="var(--color-accent-pink)"
                description="Number of independent fading paths combined using Maximal Ratio Combining."
              />

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  To achieve a BER of $10^{-3}$:
                  <ul className="mt-2 space-y-1">
                    <li><strong className="text-blue-400">AWGN:</strong> ~7 dB SNR</li>
                    <li><strong className="text-amber-400">Rayleigh:</strong> ~24 dB SNR!</li>
                    <li><strong className="text-pink-400">Diversity (M={diversityM}):</strong> Check the graph!</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Rayleigh BER (High SNR)" 
              math="P_b \approx \frac{1}{4 \cdot \text{SNR}}" 
              description="Notice how in fading, BER drops linearly (1/x) instead of exponentially. You need massive amounts of power to overcome fading without diversity." 
            />
          </div>

          {/* Graph */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Bit Error Rate vs SNR per bit (BPSK)</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Eb/N0 (SNR per bit) [dB]"
                yLabel="Bit Error Rate (BER)"
                xScale="linear"
                yScale="log"
                yDomain={[1e-5, 0.5]}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              Note the log scale on the Y-axis. The "Waterfall" curve is ideal.
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="The Power Penalty">
          To achieve a 1-in-1000 error rate ($10^{-3}$) without fading (AWGN), you need about 7 dB of SNR. 
          But in a Rayleigh fading channel, you need 24 dB! That's almost <strong>50 times more transmit power</strong> just to maintain the same data reliability. 
          This is exactly why we use Diversity (M &gt; 1)—it pulls the curve back towards the ideal AWGN waterfall.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
