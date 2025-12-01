/**
 * HelpText Component
 *
 * Texto de ajuda contextual com emoji seguindo Design System Habitz v2.0
 *
 * Features:
 * - Emoji opcional (default: 💡)
 * - Text em white/60 para contexto secundário
 * - Leading relaxed para leiturabilidade
 * - Flex layout com emoji fixo
 *
 * @example
 * ```tsx
 * <HelpText
 *   emoji="💡"
 *   text="Iniciantes: 5-10 min • Intermediário: 15-20 min • Avançado: 30+ min"
 * />
 * ```
 */

import React from "react";

export interface HelpTextProps {
  /** Emoji a exibir (default: 💡) */
  emoji?: string;
  /** Texto de ajuda */
  text: string;
  /** Classe CSS adicional */
  className?: string;
}

export const HelpText: React.FC<HelpTextProps> = ({
  emoji = "💡",
  text,
  className = "",
}) => {
  return (
    <div className={`flex items-start gap-2 pt-1 ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <span className="text-xs">{emoji}</span>
      </div>
      <p className="text-xs text-white/60 leading-relaxed">
        {text}
      </p>
    </div>
  );
};
