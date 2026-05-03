import { useState, useCallback } from 'react';

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  formatValue,
  color = 'var(--color-accent-teal)',
  description,
}) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ' ' + unit : ''}`;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
        <span
          className="text-sm font-mono font-semibold px-2 py-0.5 rounded"
          style={{
            color,
            background: `color-mix(in oklch, ${color} 15%, transparent)`,
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        className="param-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          '--slider-color': color,
        }}
      />
      <div className="flex justify-between mt-1 mb-1">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{min}{unit}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{max}{unit}</span>
      </div>
      {description && (
        <div className="text-xs mt-2 italic" style={{ color: 'var(--color-text-tertiary)', borderLeft: `2px solid ${color}`, paddingLeft: '8px' }}>
          {description}
        </div>
      )}
    </div>
  );
}

export function ParameterPanel({ title, children, className = '' }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`glass-card p-5 ${className}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex justify-between items-center mb-4 cursor-pointer bg-transparent border-none"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <h3 className="text-base font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-teal)' }} />
          {title}
        </h3>
        <span
          className="text-lg transition-transform"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>
      {!collapsed && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export function ToggleGroup({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 p-1 rounded-lg ${className}`} style={{ background: 'var(--color-bg-tertiary)' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer border-none"
          style={{
            background: value === opt.value ? 'var(--color-accent-teal)' : 'transparent',
            color: value === opt.value ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function InfoCallout({ type = 'info', title, children }) {
  const colors = {
    info: { bg: 'var(--color-accent-blue)', icon: 'ℹ️' },
    tip: { bg: 'var(--color-accent-green)', icon: '💡' },
    warning: { bg: 'var(--color-accent-amber)', icon: '⚠️' },
    engineer: { bg: 'var(--color-accent-violet)', icon: '🔧' },
    aha: { bg: 'var(--color-accent-teal)', icon: '✨' },
    guide: { bg: '#ec4899', icon: '🧭' },
  };

  const { bg, icon } = colors[type] || colors.info;

  return (
    <div
      className="rounded-lg p-4 my-4"
      style={{
        background: `color-mix(in oklch, ${bg} 10%, var(--color-bg-secondary))`,
        borderLeft: `3px solid ${bg}`,
      }}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div>
          {title && <strong className="block mb-1 text-sm">{title}</strong>}
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
