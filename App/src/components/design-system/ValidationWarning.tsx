/**
 * ValidationWarning Component
 *
 * Warning não-bloqueante para validações seguindo Design System Habitz v2.0
 *
 * Features:
 * - Background amarelo translúcido
 * - Icon AlertCircle do Lucide
 * - Text em amarelo claro
 * - Não bloqueia ações (apenas avisa)
 * - Leading relaxed para leiturabilidade
 *
 * @example
 * ```tsx
 * {validation.warning && (
 *   <ValidationWarning message={validation.warning} />
 * )}
 * ```
 */

import React from "react";
import { AlertCircle } from "lucide-react";

export interface ValidationWarningProps {
  /** Mensagem de warning a exibir */
  message: string;
  /** Classe CSS adicional */
  className?: string;
}

export const ValidationWarning: React.FC<ValidationWarningProps> = ({
  message,
  className = "",
}) => {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 ${className}`}>
      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-yellow-200/90 leading-relaxed">
        {message}
      </p>
    </div>
  );
};
