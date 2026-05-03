import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParameterSlider, ParameterPanel, InfoCallout } from '../../components/interactive/ParameterPanel';
import { Equation, EquationCard } from '../../components/math/Equation';
import { wattToDbm, dbmToWatt, dbmToDbw, dbwToDbm } from '../../utils/wireless-math';
import { DB_EXAMPLES } from '../../utils/constants';

function BrightnessDemo({ dbValue }) {
  const ratio = Math.pow(10, dbValue / 10);
  const opacity = Math.min(1, ratio / 100);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: `radial-gradient(circle, oklch(0.82 0.14 80 / ${opacity}), transparent 70%)` }}>
        <span className="text-2xl">💡</span>
      </div>
      <div>
        <div className="text-sm font-mono" style={{ color: 'var(--color-accent-amber)' }}>
          {ratio.toFixed(1)}× original power
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {dbValue > 0 ? 'Brighter' : dbValue < 0 ? 'Dimmer' : 'Same'}
        </div>
      </div>
    </div>
  );
}

function DbScale() {
  const levels = DB_EXAMPLES;
  const maxDb = 140;
  return (
    <div className="space-y-2">
      {levels.map((l) => (
        <div key={l.name} className="flex items-center gap-3">
          <div className="w-24 text-xs text-right flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
            {l.name}
          </div>
          <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(l.db / maxDb) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                background: `linear-gradient(90deg, var(--color-accent-teal), ${l.db > 100 ? 'var(--color-accent-red)' : 'var(--color-accent-blue)'})`,
              }}
            />
          </div>
          <span className="w-12 text-xs font-mono font-semibold" style={{ color: 'var(--color-accent-teal)' }}>
            {l.db} dB
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Decibels() {
  const [inputWatts, setInputWatts] = useState(1);
  const [dbChange, setDbChange] = useState(3);

  const dbmVal = wattToDbm(inputWatts);
  const dbwVal = dbmToDbw(dbmVal);
  const afterDbChange = Math.pow(10, dbChange / 10);

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent-teal)' }}>1.3 · Fundamentals</span>
        </div>
        <h1 className="mb-3">Decibels (dB, dBm, dBi)</h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
          Engineers use decibels because wireless signals span enormous ranges — from picowatts to kilowatts.
          The logarithmic scale makes these manageable.
        </p>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Converter */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">Power Converter</h3>
            <ParameterSlider label="Power (Watts)" value={inputWatts} min={0.001} max={100} step={0.001}
              onChange={setInputWatts} formatValue={(v) => v >= 1 ? `${v.toFixed(1)} W` : `${(v * 1000).toFixed(1)} mW`} 
              description="The absolute transmit power of your system. Even 1 Watt is quite strong for modern cell phones (which transmit at ~0.2W)." />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Watts</div>
                <div className="font-mono font-bold text-sm" style={{ color: 'var(--color-accent-teal)' }}>
                  {inputWatts >= 1 ? `${inputWatts.toFixed(2)} W` : `${(inputWatts * 1000).toFixed(1)} mW`}
                </div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>dBm</div>
                <div className="font-mono font-bold text-sm" style={{ color: 'var(--color-accent-blue)' }}>{dbmVal.toFixed(1)}</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--color-bg-tertiary)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>dBW</div>
                <div className="font-mono font-bold text-sm" style={{ color: 'var(--color-accent-violet)' }}>{dbwVal.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* dB Change Demo */}
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4">What Does +X dB Mean?</h3>
            <ParameterSlider label="Change in dB" value={dbChange} min={-10} max={20} step={1}
              onChange={setDbChange} unit="dB" color="var(--color-accent-amber)" 
              description="The relative change in power. Positive dB means amplification (gain), negative dB means attenuation (loss). Notice how +3dB exactly doubles the power!" />
            <div className="mt-4"><BrightnessDemo dbValue={dbChange} /></div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
              <Equation math={`+${dbChange}\\text{ dB} = \\times ${afterDbChange.toFixed(2)}\\text{ in linear power}`} />
            </div>
          </div>
        </div>

        {/* Equations */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <EquationCard title="Power in dBm" math="P_{dBm} = 10 \cdot \log_{10}\left(\frac{P_{mW}}{1 \text{ mW}}\right)" description="dBm is referenced to 1 milliwatt" />
          <EquationCard title="Power in dBW" math="P_{dBW} = 10 \cdot \log_{10}\left(\frac{P_W}{1 \text{ W}}\right)" description="dBW is referenced to 1 watt. dBW = dBm − 30" />
        </div>

        {/* Sound Level Scale */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-base font-semibold mb-4">The dB Scale in Everyday Life</h3>
          <DbScale />
        </div>

        {/* Memory aids */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { db: '+3 dB', effect: 'Double power', emoji: '×2', color: '#14b8a6' },
            { db: '+10 dB', effect: '10× power', emoji: '×10', color: '#6366f1' },
            { db: '+20 dB', effect: '100× power', emoji: '×100', color: '#8b5cf6' },
          ].map((item) => (
            <div key={item.db} className="glass-card p-5 text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: item.color }}>{item.db}</div>
              <div className="text-lg font-mono font-bold mb-1" style={{ color: 'var(--color-accent-amber)' }}>{item.emoji}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.effect}</div>
            </div>
          ))}
        </div>

        <InfoCallout type="aha" title="Key Memory Aid">
          3 dB = double power, 10 dB = 10× power. These two rules let you estimate almost any dB conversion
          mentally. For example: +13 dB = +10 dB + 3 dB = 10× then 2× = 20× power!
        </InfoCallout>
      </motion.div>
    </div>
  );
}
