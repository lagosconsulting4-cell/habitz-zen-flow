/**
 * StandardCard Component
 *
 * Card simples e versátil seguindo Design System Habitz v2.0
 *
 * Features:
 * - Background translúcido com border
 * - Hover state opcional
 * - Click handler opcional
 * - Padding consistente
 * - Margin horizontal padrão
 *
 * @example
 * ```tsx
 * <StandardCard hover onClick={() => navigate('/details')}>
 *   <div className="flex items-center justify-between">
 *     <p className="text-base font-semibold text-white">Título</p>
 *     <ChevronRight className="h-5 w-5 text-white/40" />
 *   </div>
 * </StandardCard>
 * ```
 */

import React from "react";

export interface StandardCardProps {
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Habilitar hover effects */
  hover?: boolean;
  /** Handler de click (torna o card clicável) */
  onClick?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  children,
  hover = false,
  onClick,
  className = "",
}) => {
  const baseClasses = "mx-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4";
  const hoverClasses = hover
    ? "transition-all duration-200 hover:bg-white/10 hover:border-white/20 cursor-pointer"
    : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};
