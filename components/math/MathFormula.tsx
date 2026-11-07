'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

export interface MathFormulaProps {
  math?: string;
  children?: React.ReactNode;
  block?: boolean;
  className?: string;
}

function safeRenderKatex(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml'
    });
  } catch {
    return null;
  }
}

/**
 * Componente KaTeX de alto rendimiento y cero fallos para notación matemática.
 * Soporta tanto strings puros de TeX como texto mixto con delimitadores $...$ y $$...$$
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  children,
  block = false,
  className = ''
}) => {
  const content = useMemo(() => {
    if (typeof math === 'string') return math;
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return children
        .map((c) => (typeof c === 'string' ? c : ''))
        .join('');
    }
    return '';
  }, [math, children]);

  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Si contiene delimitadores de KaTeX inline ($...$) o bloque ($$...$$)
    const containsDelimiters = content.includes('$');

    if (!containsDelimiters) {
      const html = safeRenderKatex(content, block);
      if (html) {
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      }
      return <code>{content}</code>;
    }

    // Procesar texto mixto con partes de texto y partes matemáticas
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const tex = part.slice(2, -2).trim();
        const html = safeRenderKatex(tex, true);
        if (html) {
          return (
            <span
              key={idx}
              className="block my-2"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <code key={idx}>{part}</code>;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const tex = part.slice(1, -1).trim();
        const html = safeRenderKatex(tex, false);
        if (html) {
          return (
            <span
              key={idx}
              className="inline-block px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <code key={idx}>{part}</code>;
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  }, [content, block]);

  return (
    <span
      className={`inline-math-container font-serif tracking-tight ${
        block ? 'block text-center my-3' : 'inline'
      } ${className}`}
    >
      {renderedContent}
    </span>
  );
};

export default MathFormula;
