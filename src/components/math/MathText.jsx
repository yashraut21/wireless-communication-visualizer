import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * MathText — renders a string that contains $...$ inline LaTeX tokens.
 * Example: "Frequency ($f_c$) affects path loss."
 *  → renders "Frequency (" + <InlineMath math="f_c" /> + ") affects path loss."
 */
export function MathText({ text, className = '' }) {
  if (!text) return null;

  // Split on $...$ tokens. The regex captures the content between $ signs.
  const parts = text.split(/\$([^$]+)\$/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 0
          ? part  // plain text segment
          : <InlineMath key={i} math={part} />  // math segment
      )}
    </span>
  );
}
