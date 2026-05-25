import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/** Graceful fallback when KaTeX can't parse the formula */
function MathError({ error, math }) {
  return (
    <span
      title={error?.message}
      style={{ color: 'var(--color-accent-red, #ef4444)', fontFamily: 'monospace', fontSize: '0.85em' }}
    >
      {math}
    </span>
  );
}

export function Equation({ math, block = false, className = '' }) {
  if (block) {
    return (
      <div className={`equation-block ${className}`}>
        <BlockMath
          math={math}
          renderError={(error) => <MathError error={error} math={math} />}
        />
      </div>
    );
  }
  return (
    <InlineMath
      math={math}
      renderError={(error) => <MathError error={error} math={math} />}
    />
  );
}

export function EquationCard({ title, math, description, className = '' }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-accent-teal)' }}>
          {title}
        </h4>
      )}
      <div className="my-3">
        <BlockMath
          math={math}
          renderError={(error) => <MathError error={error} math={math} />}
        />
      </div>
      {description && (
        <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
