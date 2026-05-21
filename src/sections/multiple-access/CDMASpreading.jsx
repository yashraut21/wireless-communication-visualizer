import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { InlineMath } from 'react-katex';
import { LineChart } from '../../components/charts/LineChart';

export default function CDMASpreading() {
  const [spreadingFactor, setSpreadingFactor] = useState(8);

  // Generate deterministic random bits based on spreading factor
  const generateCode = (length) => {
    let seed = 12345;
    const lcg = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length }).map(() => (lcg() > 0.5 ? 1 : -1));
  };

  const chartData = useMemo(() => {
    const dataBits = [1, -1]; // Two data bits
    const N = spreadingFactor; // Chips per data bit
    
    // Total chips
    const chipCode = generateCode(dataBits.length * N);
    
    const timeDataSignal = [];
    const timeChipSignal = [];
    const timeSpreadSignal = [];
    
    const POINTS_PER_CHIP = 10;
    
    for (let bitIdx = 0; bitIdx < dataBits.length; bitIdx++) {
      const dataBit = dataBits[bitIdx];
      
      for (let chipIdx = 0; chipIdx < N; chipIdx++) {
        const absoluteChipIdx = bitIdx * N + chipIdx;
        const chip = chipCode[absoluteChipIdx];
        const spreadChip = dataBit * chip;
        
        for (let p = 0; p < POINTS_PER_CHIP; p++) {
          const t = absoluteChipIdx + p / POINTS_PER_CHIP;
          
          timeDataSignal.push({ x: t, y: dataBit });
          timeChipSignal.push({ x: t, y: chip });
          timeSpreadSignal.push({ x: t, y: spreadChip });
        }
        
        // Add a sharp vertical transition
        if (absoluteChipIdx !== chipCode.length - 1) {
          const t = absoluteChipIdx + 1;
          const nextDataBit = dataBits[Math.floor((absoluteChipIdx + 1) / N)];
          const nextChip = chipCode[absoluteChipIdx + 1];
          timeDataSignal.push({ x: t, y: dataBit }); // duplicate point for sharp line
          timeDataSignal.push({ x: t, y: nextDataBit }); 
        }
      }
    }

    // Rough approximation of frequency spectrum (Sinc envelope)
    const freqData = [];
    const freqSpread = [];
    
    for (let f = 0; f <= 5; f += 0.05) {
      // Narrowband data spectrum (sinc(f*T_b))
      const dataVal = Math.max(0.01, Math.abs(Math.sin(Math.PI * f) / (Math.PI * f)));
      
      // Wideband spread spectrum (sinc(f*T_c))
      // T_c = T_b / N
      const spreadVal = Math.max(0.01, (1/N) * Math.abs(Math.sin(Math.PI * f / N) / (Math.PI * f / N)));
      
      freqData.push({ x: f, y: f === 0 ? 1 : dataVal });
      freqSpread.push({ x: f, y: f === 0 ? 1/N : spreadVal });
    }

    return {
      dataLine: [{ label: 'Data Bit (Slow)', color: '#3b82f6', data: timeDataSignal }],
      chipLine: [{ label: 'Chipping Code (Fast)', color: '#10b981', data: timeChipSignal }],
      spreadLine: [{ label: 'Spread Signal (Transmitted)', color: '#ec4899', data: timeSpreadSignal }],
      freqLines: [
        { label: 'Data Spectrum', color: '#3b82f6', data: freqData },
        { label: 'Spread Spectrum', color: '#ec4899', data: freqSpread }
      ]
    };
  }, [spreadingFactor]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ color: '#3b82f6' }}>8.2 · Multiple Access</span>
        </div>
        <h1 className="mb-3">CDMA & Spreading</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          In Code Division Multiple Access (CDMA), we multiply a slow user data signal by a very fast pseudo-random "chipping code". 
          This spreads the narrow data spectrum across a huge bandwidth, allowing multiple users to overlap completely in both time and frequency.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="Spreading Factor (N)" 
                value={spreadingFactor} min={4} max={16} step={2}
                onChange={setSpreadingFactor} 
                color="var(--color-accent-blue)"
                description="The number of chips per data bit. Also known as Processing Gain."
              />

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Processing Gain</div>
                  <div className="font-mono text-lg font-bold" style={{ color: 'var(--color-accent-teal)' }}>
                    {10 * Math.log10(spreadingFactor).toFixed(1)} dB
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Direct Sequence Spreading" 
              math="s(t) = d(t) \cdot c(t)" 
              description="Data d(t) is multiplied by Code c(t). Since c(t) toggles much faster, the resulting signal s(t) takes on the wide bandwidth of the code." 
            />
            
            <InfoCallout type="tip" title="Despreading at Receiver">
            The receiver multiplies the noisy incoming signal by the <em>exact same</em> code <InlineMath math="c(t)" />. Because
              <InlineMath math="c(t) \cdot c(t) = 1" />, the original data pops back out! Other users' codes look like random
              noise and get suppressed by the Processing Gain.
            </InfoCallout>
          </div>

          {/* Graphs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Time Domain: Spreading Process</h3>
              <div className="grid grid-rows-3 gap-2 min-h-[300px]">
                <div className="h-[100px] border-b border-white/10">
                  <LineChart data={chartData.dataLine} xLabel="" yLabel="Data d(t)" yDomain={[-1.5, 1.5]} height={100} showGrid={false} />
                </div>
                <div className="h-[100px] border-b border-white/10">
                  <LineChart data={chartData.chipLine} xLabel="" yLabel="Code c(t)" yDomain={[-1.5, 1.5]} height={100} showGrid={false} />
                </div>
                <div className="h-[100px]">
                  <LineChart data={chartData.spreadLine} xLabel="Time (Chips)" yLabel="Spread s(t)" yDomain={[-1.5, 1.5]} height={100} showGrid={false} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Frequency Domain: Spectral Expansion</h3>
              <div className="min-h-[250px]">
                <LineChart 
                  data={chartData.freqLines}
                  multiLine={true}
                  xLabel="Frequency"
                  yLabel="Power Spectral Density"
                  yScale="log"
                  yDomain={[0.001, 1.5]}
                  height={280}
                />
              </div>
              <div className="text-xs text-center mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Notice how increasing the spreading factor widens the spread spectrum and lowers its peak density. 
                This hides the signal below the noise floor!
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Visualize how a chipping code spreads a signal across a wide bandwidth.<br/>
          <strong>Action:</strong> Increase the "Spreading Factor (N)" slider.<br/>
          <strong>Practical Conclusion:</strong> As you increase N, observe the Frequency Domain graph. The spread spectrum becomes wider and its peak power density drops significantly. In practice, this means the CDMA signal looks like low-level background noise to other systems, making it highly resistant to narrowband interference and eavesdropping.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
