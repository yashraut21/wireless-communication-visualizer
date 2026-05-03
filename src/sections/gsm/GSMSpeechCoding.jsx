import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

export default function GSMSpeechCoding() {
  const [filterOrder, setFilterOrder] = useState(8);

  const chartData = useMemo(() => {
    // Generate a fake "speech" segment and its "residual" after filtering
    const dataSpeech = [];
    const dataResidual = [];
    
    // Simulate vocal tract resonances (formants)
    for (let i = 0; i < 160; i++) {
      const t = i * 0.1;
      // Original Speech: Pitch (low freq) + Formants (high freq) + noise
      const speech = Math.sin(t * 1.5) + 0.5 * Math.sin(t * 4.2) + 0.2 * Math.random();
      dataSpeech.push({ x: i, y: speech });
      
      // Residual: The "unpredictable" part. Higher filter order = smaller residual.
      // E.g. order 1 leaves a lot. order 10 leaves very little.
      const compression = Math.max(0.1, 1 - (filterOrder / 12));
      const residual = (0.3 * Math.sin(t * 8.5) + 0.5 * Math.random()) * compression;
      dataResidual.push({ x: i, y: residual });
    }

    return {
      speech: [{ label: 'Original Speech (20ms = 160 samples)', color: '#3b82f6', data: dataSpeech }],
      residual: [{ label: `Excitation Residual (After Order-${filterOrder} Filter)`, color: '#ef4444', data: dataResidual }]
    };
  }, [filterOrder]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
          <span className="text-sm font-medium" style={{ color: '#8b5cf6' }}>9.3 · GSM System</span>
        </div>
        <h1 className="mb-3">Speech Coding (RPE-LTP)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Standard telephone audio is 64 kbps. GSM needs to compress this to 13 kbps to fit over the radio link. 
          Instead of just sending audio waves, GSM acts like a "vocal tract synthesizer."
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Parameters</h3>
              
              <ParameterSlider 
                label="LPC Filter Order" 
                value={filterOrder} min={1} max={10} step={1}
                onChange={setFilterOrder} 
                color="var(--color-accent-violet)"
                description="Higher order filters model the vocal tract more accurately, leaving a smaller 'residual' error to transmit. GSM uses an Order-8 filter."
              />

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-sm font-bold mb-3 text-white">The 260-bit payload (per 20ms):</div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300">
                    <span>LPC Filter Coefficients</span>
                    <span>36 bits</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                    <span>Long Term Prediction (Pitch)</span>
                    <span>36 bits</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-red-500/20 border border-red-500/30 text-red-300">
                    <span>Regular Pulse Excitation</span>
                    <span>188 bits</span>
                  </div>
                  <div className="flex justify-between items-center p-2 font-bold text-white border-t border-white/20">
                    <span>Total Rate:</span>
                    <span>13.0 kbps</span>
                  </div>
                </div>
              </div>
            </div>
            
            <EquationCard 
              title="Linear Predictive Coding (LPC)" 
              math="s(n) \approx \sum_{k=1}^P a_k s(n-k)" 
              description="The current speech sample is predicted as a linear combination of the previous P samples. The coefficients (a_k) represent the shape of your throat and mouth." 
            />
          </div>

          {/* Graphs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Original Audio Segment</h3>
              <div className="h-[150px]">
                <LineChart 
                  data={chartData.speech}
                  xLabel=""
                  yLabel="Amplitude"
                  yDomain={[-2, 2]}
                  height={150}
                  showGrid={false}
                />
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-2">Filter Residual (Error)</h3>
              <div className="h-[150px]">
                <LineChart 
                  data={chartData.residual}
                  xLabel="Samples (n)"
                  yLabel="Error e(n)"
                  yDomain={[-2, 2]}
                  height={150}
                  showGrid={false}
                />
              </div>
              <div className="text-xs text-center mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
                Instead of sending the massive Original Audio, GSM sends the <strong>Filter Coefficients</strong> + this tiny <strong>Residual</strong>. The receiver uses the filter to re-synthesize the original audio!
              </div>
            </div>
          </div>
        </div>

        <InfoCallout type="tip" title="Why GSM sounds like GSM">
          Because the codec is literally modeling a human vocal tract, it is highly optimized for human speech. However, if you try to send music or a modem tone through a GSM call, the LPC filter completely fails to model it, resulting in horribly distorted audio!
        </InfoCallout>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Understand how predictive modeling compresses audio.<br/>
          <strong>Action:</strong> Slide the "LPC Filter Order" from 1 to 10.<br/>
          <strong>Practical Conclusion:</strong> Notice how the "Error e(n)" residual shrinks as you increase the filter order. A higher order models the physical vocal tract more accurately, meaning the "prediction" is better. Sending the tiny error + filter coefficients takes vastly fewer bits than sending the entire audio waveform, which is how GSM achieves its 13 kbps rate.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
