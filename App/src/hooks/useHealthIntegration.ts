/**
 * Stub para integração Health (futuro).
 * Retorna flags para habilitar/desabilitar rotas/CTA ligados ao source "health".
 */
export const useHealthIntegration = () => {
  const enabled = Boolean(import.meta.env.VITE_HEALTH_ENABLED === "true");
  return {
    enabled,
    status: enabled ? "planned" : "disabled",
    note: enabled
      ? "Integração com apps de saúde habilitada via flag. Implementar wrapper nativo/PWA."
      : "Integração Health desabilitada. Use criação manual por enquanto.",
  };
};

export default useHealthIntegration;
