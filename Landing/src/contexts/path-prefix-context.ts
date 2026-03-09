import { createContext } from "react";
import type { NavigateOptions } from "react-router-dom";

export type PathPrefix = "" | "/direct" | "/antigo" | "/bora" | "/upsell-bora" | "/downsell-bora" | "/rec-aq" | "/mini" | "/metodo-rendasecreta" | "/metodo-rendasecreta-combo";

export interface PathPrefixContextValue {
  prefix: PathPrefix;
  navigate: (to: string, options?: NavigateOptions) => void;
}

export const PathPrefixContext = createContext<PathPrefixContextValue | undefined>(undefined);
