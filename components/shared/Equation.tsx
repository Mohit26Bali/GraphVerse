import katex from "katex";

export interface EquationProps {
  tex: string;
  className?: string;
  displayMode?: boolean;
}

export function Equation({ tex, className, displayMode = true }: EquationProps) {
  const html = katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
  });

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
