/**
 * PageHeader Component
 *
 * Header padrão para páginas do app seguindo o Design System Habitz v2.0
 *
 * Features:
 * - Título em uppercase com tracking amplo
 * - Descrição opcional em texto secundário
 * - Padding consistente (px-4 pt-6 pb-4)
 * - Typography premium (bold uppercase)
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="MEUS HÁBITOS"
 *   description="Gerencie seus hábitos ativos e pausados"
 * />
 * ```
 */

import React from "react";

export interface PageHeaderProps {
  /** Título da página (será convertido para UPPERCASE) */
  title: string;
  /** Descrição opcional da página */
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-white/60">
          {description}
        </p>
      )}
    </div>
  );
};
