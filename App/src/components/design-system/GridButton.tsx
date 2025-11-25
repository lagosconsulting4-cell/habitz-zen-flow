/**
 * GridButton Component
 *
 * Botão para uso em grids de opções/sugestões seguindo Design System Habitz v2.0
 *
 * Features:
 * - Estado selected com lime background
 * - Estado inactive com background translúcido
 * - Hover states responsivos
 * - Transições suaves
 * - Text em font semibold
 *
 * @example
 * ```tsx
 * <div className="grid grid-cols-3 gap-2">
 *   <GridButton selected={true} onClick={() => {}}>
 *     5 min
 *   </GridButton>
 *   <GridButton selected={false} onClick={() => {}}>
 *     10 min
 *   </GridButton>
 * </div>
 * ```
 */

import React from "react";

export interface GridButtonProps {
  /** Conteúdo do botão */
  children: React.ReactNode;
  /** Se o botão está selecionado (lime accent) */
  selected: boolean;
  /** Handler de click */
  onClick: () => void;
  /** Desabilitar o botão */
  disabled?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

export const GridButton: React.FC<GridButtonProps> = ({
  children,
  selected,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
        selected
          ? "bg-lime-400 text-black"
          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};
