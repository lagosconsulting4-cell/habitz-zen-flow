/**
 * SectionCard Component
 *
 * Card padrão com header e icon seguindo Design System Habitz v2.0
 *
 * Features:
 * - Header com icon em container lime
 * - Label uppercase com tracking amplo
 * - Valor opcional em font semibold
 * - Body opcional com border-top
 * - Overflow hidden para rounded borders
 *
 * @example
 * ```tsx
 * <SectionCard
 *   icon={Target}
 *   label="META"
 *   value="10 minutos"
 * >
 *   <p className="text-sm text-white/60">
 *     Conteúdo adicional
 *   </p>
 * </SectionCard>
 * ```
 */

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface SectionCardProps {
  /** Ícone Lucide para exibir no header */
  icon: LucideIcon;
  /** Label em uppercase (será convertido automaticamente) */
  label: string;
  /** Valor opcional a exibir abaixo do label */
  value?: string | number;
  /** Elemento opcional no canto direito do header */
  rightElement?: React.ReactNode;
  /** Conteúdo opcional do body do card */
  children?: React.ReactNode;
  /** Classe CSS adicional para customização */
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  label,
  value,
  rightElement,
  children,
  className = "",
}) => {
  return (
    <div className={`mx-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
            <Icon className="h-6 w-6 text-lime-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              {label}
            </p>
            {value !== undefined && (
              <p className="text-base font-semibold text-white">
                {value}
              </p>
            )}
          </div>
        </div>
        {rightElement && (
          <div>
            {rightElement}
          </div>
        )}
      </div>

      {/* Body (opcional) */}
      {children && (
        <div className="border-t border-white/10 px-4 py-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};
