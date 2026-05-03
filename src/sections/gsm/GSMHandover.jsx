import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, InfoCallout } from '../../components/interactive/ParameterPanel';
import { EquationCard } from '../../components/math/Equation';
import { LineChart } from '../../components/charts/LineChart';

export default function GSMHandover() {
  const [hysteresis, setHysteresis] = useState(6);
  const [threshold, setThreshold] = useState(-85);

  const chartData = useMemo(() => {
    const bs1Data = [];
    const bs2Data = [];
    const servingBsData = [];
    
    // Simulate user moving from BS1 (x=0) to BS2 (x=100)
    // Signal drops according to path loss + some shadow fading noise
    
    // Predetermined shadow fading so it doesn't flicker on slider change
    const shadowMap = Array.from({ length: 101 }).map(() => (Math.random() - 0.5) * 8);

    let currentServing = 1; // Start connected to BS1

    for (let distance = 0; distance <= 100; distance++) {
      const d1 = Math.max(1, distance);
      const d2 = Math.max(1, 100 - distance);
      
      // Simple log-distance path loss
      const rx1 = -50 - 20 * Math.log10(d1) + shadowMap[distance];
      const rx2 = -50 - 20 * Math.log10(d2) + shadowMap[100 - distance];
      
      bs1Data.push({ x: distance, y: rx1 });
      bs2Data.push({ x: distance, y: rx2 });

      // Handover Logic
      if (currentServing === 1) {
        // Handover to BS2 if BS1 is weak AND BS2 is significantly stronger (Hysteresis)
        if (rx1 < threshold && rx2 > rx1 + hysteresis) {
          currentServing = 2;
        }
      } else {
        // Handover to BS1 if BS2 is weak AND BS1 is significantly stronger
        if (rx2 < threshold && rx1 > rx2 + hysteresis) {
          currentServing = 1;
        }
      }

      servingBsData.push({ x: distance, y: currentServing === 1 ? rx1 : rx2 });
    }

    return {
      lines: [
        { label: 'BS1 Signal', color: '#3b82f6', data: bs1Data, dashed: true },
        { label: 'BS2 Signal', color: '#f59e0b', data: bs2Data, dashed: true },
        { label: 'Active Connection', color: '#10b981', data: servingBsData }
      ]
    };
  }, [hysteresis, threshold]);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ec4899' }} />
          <span className="text-sm font-medium" style={{ color: '#ec4899' }}>9.4 · GSM System</span>
        </div>
        <h1 className="mb-3">Mobile-Assisted Handover (MAHO)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          As a user drives across a city, their phone constantly measures neighboring cell towers. To prevent the phone from rapidly bouncing back and forth between towers (the "ping-pong" effect), GSM uses a Hysteresis margin.
        </p>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold mb-4">Handover Rules</h3>
              
              <ParameterSlider 
                label="Hysteresis Margin (dB)" 
                value={hysteresis} min={0} max={15} step={1}
                onChange={setHysteresis} 
                color="var(--color-accent-amber)"
                description="The new tower must be THIS much stronger than the current tower before a handover is triggered. Set to 0 to see the ping-pong effect!"
              />

              <div className="mt-6">
                <ParameterSlider 
                  label="Minimum Rx Threshold (dBm)" 
                  value={threshold} min={-100} max={-70} step={1}
                  onChange={setThreshold} 
                  color="var(--color-text-tertiary)"
                  description="Handover is only considered if the current tower's signal drops below this threshold."
                />
              </div>
            </div>
            
            <EquationCard 
              title="Handover Condition" 
              math="P_{new} > P_{old} + Hysteresis" 
              description="A handover only occurs if the new base station is significantly stronger than the current one, overcoming localized shadowing fluctuations." 
            />
          </div>

          {/* Graphs */}
          <div className="lg:col-span-8 glass-card p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-4">Received Signal Level vs Distance</h3>
            <div className="flex-1 min-h-[400px]">
              <LineChart 
                data={chartData.lines}
                multiLine={true}
                xLabel="Distance (Moving from BS1 to BS2)"
                yLabel="Received Power (dBm)"
                yDomain={[-110, -40]}
                height={450}
              />
            </div>
            <div className="mt-4 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              The green line represents the actual signal quality the user experiences. <br/>
              Notice how increasing hysteresis delays the handover until BS2 is clearly dominant.
            </div>
          </div>
        </div>

        <InfoCallout type="aha" title="Why Mobile-Assisted?">
          In 1G systems, only the base stations measured signal strength. By the time the network realized you were driving away, the call often dropped! In GSM (2G), the mobile phone itself constantly measures up to 6 neighboring towers during its idle time slots and sends reports back to the network. The network then makes a fast, informed handover decision.
        </InfoCallout>

        <InfoCallout type="guide" title="How to use this visualizer">
          <strong>Goal:</strong> Understand why a Hysteresis margin is necessary in cellular handovers.<br/>
          <strong>Action:</strong> Set Hysteresis to 0 dB, then increase it to 10 dB while observing the "Active Connection" (green line).<br/>
          <strong>Practical Conclusion:</strong> With 0 dB hysteresis, the phone rapidly jumps back and forth between BS1 and BS2 due to small signal fluctuations (shadowing). This "ping-pong" effect overloads the network with handover requests and drops calls. Adding Hysteresis forces the phone to wait until the new tower is <em>decisively</em> stronger, ensuring a stable connection.
        </InfoCallout>
      </motion.div>
    </div>
  );
}
