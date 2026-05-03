import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';

export default function FadingPro() {
  const [speedKmh, setSpeedKmh] = useState(50);
  const [kFactorDb, setKFactorDb] = useState(-10); // -10 is basically Rayleigh, 10 is strong LOS
  const [numPaths, setNumPaths] = useState(8);

  const freqMhz = 900;
  const c = 3e8;

  // Pre-generate random phases and angles for sum-of-sinusoids model
  const scatterers = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      angle: Math.random() * 2 * Math.PI,
      phase: Math.random() * 2 * Math.PI
    }));
  }, []); // Only re-generate if we wanted a new random seed

  // State to hold the sliding time window and histogram bins
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState([]);
  const [bins, setBins] = useState(new Array(20).fill(0));

  useEffect(() => {
    // Reset history and bins when parameters change
    setHistory([]);
    setBins(new Array(20).fill(0));
    setTime(0);
  }, [speedKmh, kFactorDb, numPaths]);

  useEffect(() => {
    let animationFrameId;
    let t = time;
    let localHistory = [...history];
    let localBins = [...bins];
    
    // Convert K factor to linear
    const K = Math.pow(10, kFactorDb / 10);
    // V_LOS is derived from K. If K is small, V_LOS is small.
    // E[envelope^2] = 2 * sigma^2 + V_LOS^2 = 1 (normalized power)
    // K = V_LOS^2 / (2 * sigma^2)
    // So V_LOS^2 = K * 2 * sigma^2
    // 1 = 2 * sigma^2 + K * 2 * sigma^2 = 2 * sigma^2 * (1 + K)
    const sigma2 = 1 / (2 * (1 + K));
    const vLos = Math.sqrt(2 * K * sigma2);
    
    const dopplerMax = (speedKmh * 1000 / 3600) / (c / (freqMhz * 1e6));

    const update = () => {
      t += 0.002; // Increment time
      
      // Calculate fading envelope using sum of sinusoids
      let iComp = 0;
      let qComp = 0;
      
      // Sum over multipath components
      for (let n = 0; n < numPaths; n++) {
        const dopplerShift = dopplerMax * Math.cos(scatterers[n].angle);
        const theta = 2 * Math.PI * dopplerShift * t + scatterers[n].phase;
        iComp += Math.cos(theta);
        qComp += Math.sin(theta);
      }
      
      // Normalize variance of scattered components to 2*sigma^2
      // Each sinusoid has variance 1/2. Sum of N has variance N/2.
      // We want variance sigma^2 for I and Q separately.
      const scale = Math.sqrt(sigma2 / (numPaths / 2));
      iComp = iComp * scale;
      qComp = qComp * scale;
      
      // Add LOS component (assume LOS doppler is 0 for simplicity here, or just a constant offset)
      iComp += vLos;
      
      // Envelope magnitude
      const envelope = Math.sqrt(iComp * iComp + qComp * qComp);
      const envelopeDb = 20 * Math.log10(Math.max(envelope, 0.001));

      // Update history (keep last 200 points)
      localHistory.push({ x: t, y: envelopeDb });
      if (localHistory.length > 200) localHistory.shift();

      // Update Histogram (0 to 2.5 envelope range)
      // Linear scale for histogram
      const binIndex = Math.min(19, Math.max(0, Math.floor(envelope / (2.5 / 20))));
      localBins[binIndex]++;

      // Trigger re-render occasionally to save CPU
      if (localHistory.length % 5 === 0) {
        setTime(t);
        setHistory([...localHistory]);
        setBins([...localBins]);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [time, speedKmh, kFactorDb, numPaths, scatterers]);

  // Theoretical PDF for overlay
  const pdfData = useMemo(() => {
    const data = [];
    const K = Math.pow(10, kFactorDb / 10);
    const sigma2 = 1 / (2 * (1 + K));
    const vLos = Math.sqrt(2 * K * sigma2);

    // Modified Bessel function of first kind, order 0 approximation
    const I0 = (x) => {
      let sum = 1;
      let term = 1;
      for (let k = 1; k < 10; k++) {
        term *= (x * x) / (4 * k * k);
        sum += term;
      }
      return sum;
    };

    for (let r = 0; r <= 2.5; r += 0.05) {
      let pdf = 0;
      if (K < 0.01) {
        // Rayleigh
        pdf = (r / sigma2) * Math.exp(-(r * r) / (2 * sigma2));
      } else {
        // Ricean
        pdf = (r / sigma2) * Math.exp(-(r * r + vLos * vLos) / (2 * sigma2)) * I0((r * vLos) / sigma2);
      }
      data.push({ x: r, y: pdf });
    }
    return [{ label: 'Theoretical PDF', color: '#10b981', data }];
  }, [kFactorDb]);

  // Convert bins to BarChart format
  const totalSamples = bins.reduce((a, b) => a + b, 0) || 1;
  const binWidth = 2.5 / 20;
  const barData = bins.map((count, i) => {
    const xCenter = (i + 0.5) * binWidth;
    // Normalize to PDF area: count / (total * binWidth)
    const pdfVal = count / (totalSamples * binWidth);
    return {
      x: xCenter,
      y: pdfVal,
      color: '#3b82f6'
    };
  });

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>10.3 · Playground</span>
        </div>
        <h1 className="mb-3">Fading Simulator Pro</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          A live simulation of multipath fading using the Sum-of-Sinusoids method. Watch as the instantaneous signal strength wildly fluctuates, and see how the long-term statistics perfectly match the theoretical Probability Density Function (PDF).
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4 text-white">Channel Profile</h3>
              <ParameterSlider label="K-Factor (dB)" value={kFactorDb} min={-10} max={15} step={1} onChange={setKFactorDb} color="#8b5cf6" description="-10 dB means almost no Line-of-Sight (Rayleigh). 15 dB means a very strong LOS component (Ricean)." />
              <ParameterSlider label="Speed (km/h)" value={speedKmh} min={0} max={120} step={5} onChange={setSpeedKmh} color="#f59e0b" description="Higher speed increases Doppler Shift, causing the fades to happen much faster." />
              <ParameterSlider label="Multipath Rays" value={numPaths} min={2} max={20} step={1} onChange={setNumPaths} color="#10b981" description="According to the Central Limit Theorem, ~6 or more random rays will form a perfect Rayleigh distribution." />
            </div>

            <div className="glass-card p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Total Samples:</span>
                <span className="font-mono text-sm">{totalSamples}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Max Doppler:</span>
                <span className="font-mono text-sm text-amber-500">
                  {Math.round((speedKmh * 1000 / 3600) / (c / (freqMhz * 1e6)))} Hz
                </span>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-4">Live Fading Envelope (Time Domain)</h3>
              <div className="flex-1 min-h-[200px]">
                <LineChart 
                  data={[{ label: 'Envelope', color: '#8b5cf6', data: history }]}
                  xLabel="Time (s)"
                  yLabel="Relative Power (dB)"
                  yDomain={[-40, 10]}
                  height={220}
                  showGrid={false}
                />
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col relative">
              <h3 className="text-base font-semibold mb-4">Statistical PDF Distribution</h3>
              <div className="absolute top-6 right-6 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#3b82f6] rounded" /> Measured Data</div>
                <div className="flex items-center gap-1"><div className="w-4 h-[2px] bg-[#10b981]" /> Theoretical Match</div>
              </div>
              <div className="flex-1 min-h-[250px] relative">
                <div className="absolute inset-0">
                  <BarChart 
                    data={barData}
                    xLabel="Linear Amplitude (r)"
                    yLabel="Probability Density p(r)"
                    xDomain={[0, 2.5]}
                    yDomain={[0, 1.5]}
                    barWidth={15}
                    height={250}
                  />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <LineChart 
                    data={pdfData}
                    xLabel=""
                    yLabel=""
                    xDomain={[0, 2.5]}
                    yDomain={[0, 1.5]}
                    height={250}
                    showGrid={false}
                    showAxes={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Observe how random wave interference perfectly builds classical statistical distributions over time.<br/>
          <strong>Action:</strong> Set K-Factor to -10 and wait for the blue bars to form the green Rayleigh curve. Then, slide K-Factor to 10.<br/>
          <strong>Practical Conclusion:</strong> At K=-10 (Rayleigh), the histogram peaks at a lower amplitude and has a long tail, meaning deep fades (power drops of 20-30 dB) happen frequently. When you increase the K-Factor to 10 (Ricean), the dominant Line-of-Sight wave stabilizes the signal. The histogram shifts right and becomes a bell curve, meaning deep fades almost never occur!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
