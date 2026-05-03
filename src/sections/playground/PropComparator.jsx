import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ToggleGroup, InfoCallout } from '../../components/interactive/ParameterPanel';
import { LineChart } from '../../components/charts/LineChart';

export default function PropComparator() {
  const [freqMhz, setFreqMhz] = useState(900);
  const [ht, setHt] = useState(50); // Tx height (m)
  const [hr, setHr] = useState(1.5); // Rx height (m)
  const [env, setEnv] = useState('urban_small'); // urban_small, urban_large, suburban, open
  
  const [txPower, setTxPower] = useState(43); // dBm

  const chartData = useMemo(() => {
    const fsplData = [];
    const twoRayData = [];
    const hataData = [];

    // Hata model correction factor a(h_r)
    let a_hr = 0;
    if (env === 'urban_small' || env === 'suburban' || env === 'open') {
      a_hr = (1.1 * Math.log10(freqMhz) - 0.7) * hr - (1.56 * Math.log10(freqMhz) - 0.8);
    } else if (env === 'urban_large') {
      if (freqMhz <= 300) {
        a_hr = 8.29 * Math.pow(Math.log10(1.54 * hr), 2) - 1.1;
      } else {
        a_hr = 3.2 * Math.pow(Math.log10(11.75 * hr), 2) - 4.97;
      }
    }

    for (let d = 1; d <= 20; d += 0.5) {
      // Free Space
      const fspl = 32.44 + 20 * Math.log10(d) + 20 * Math.log10(freqMhz);
      fsplData.push({ x: d, y: txPower - fspl });

      // Two-Ray (Approximate flat earth, Pr = Pt * ht^2 * hr^2 / d^4)
      // Path loss = 40log(d) - 20log(ht) - 20log(hr)
      // Note: This approximation is only valid for d > critical distance. We'll use it directly for simplicity.
      // d is in km, ht/hr in m. Need to align units.
      // L(dB) = 40log(d*1000) - 20log(ht) - 20log(hr)
      let twoRayL = 40 * Math.log10(d * 1000) - 20 * Math.log10(ht) - 20 * Math.log10(hr);
      // Ensure it doesn't perform better than free space at close ranges
      twoRayL = Math.max(twoRayL, fspl); 
      twoRayData.push({ x: d, y: txPower - twoRayL });

      // Okumura-Hata
      let hataL = 69.55 + 26.16 * Math.log10(freqMhz) - 13.82 * Math.log10(ht) - a_hr + (44.9 - 6.55 * Math.log10(ht)) * Math.log10(d);
      
      if (env === 'suburban') {
        hataL = hataL - 2 * Math.pow(Math.log10(freqMhz / 28), 2) - 5.4;
      } else if (env === 'open') {
        hataL = hataL - 4.78 * Math.pow(Math.log10(freqMhz), 2) + 18.33 * Math.log10(freqMhz) - 40.94;
      }
      
      hataData.push({ x: d, y: txPower - hataL });
    }

    return [
      { label: 'Free Space (Ideal)', color: '#3b82f6', data: fsplData },
      { label: 'Two-Ray Ground', color: '#10b981', data: twoRayData },
      { label: 'Okumura-Hata (Empirical)', color: '#ec4899', data: hataData }
    ];
  }, [freqMhz, ht, hr, env, txPower]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
          <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>10.2 · Playground</span>
        </div>
        <h1 className="mb-3">Propagation Model Comparator</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Compare how different models predict signal strength drop-off. Free space is purely theoretical, Two-Ray adds a ground reflection, and Okumura-Hata is based on massive real-world city measurements.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4 text-white">System Parameters</h3>
              <ParameterSlider label="Tx Power (dBm)" value={txPower} min={20} max={60} step={1} onChange={setTxPower} color="#3b82f6" />
              <ParameterSlider label="Frequency (MHz)" value={freqMhz} min={150} max={2000} step={50} onChange={setFreqMhz} color="#f59e0b" description="Hata model is technically only valid between 150 - 1500 MHz." />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Antenna Heights</h3>
              <ParameterSlider label="Tx Height (m)" value={ht} min={30} max={200} step={5} onChange={setHt} color="#10b981" />
              <ParameterSlider label="Rx Height (m)" value={hr} min={1} max={10} step={0.5} onChange={setHr} color="#10b981" />
              
              <h3 className="text-base font-semibold mb-4 mt-8 text-white">Environment (Hata)</h3>
              <ToggleGroup 
                options={[
                  { label: 'Urban (S)', value: 'urban_small' },
                  { label: 'Urban (L)', value: 'urban_large' },
                  { label: 'Suburban', value: 'suburban' },
                  { label: 'Open', value: 'open' }
                ]}
                value={env}
                onChange={setEnv}
              />
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Received Power vs Distance</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData}
                multiLine={true}
                xLabel="Distance (km)"
                yLabel="Received Power (dBm)"
                yDomain={[-160, -40]}
                height={450}
              />
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Understand why theoretical models fail in the real world.<br/>
          <strong>Action:</strong> Compare the blue line (Free Space) to the pink line (Hata) while changing the Environment from "Open" to "Urban".<br/>
          <strong>Practical Conclusion:</strong> Notice that Free Space is vastly optimistic. The empirical Okumura-Hata model shows that in a dense city (Urban), buildings absorb and block signals massively, dropping power by an additional 20-30 dB compared to Free Space. Also note how increasing the Tx Height pushes all non-free-space lines upward, extending your cell coverage!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
