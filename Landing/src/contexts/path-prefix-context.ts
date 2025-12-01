import { createContext } from "react";
import type { NavigateOptions } from "react-router-dom";

export type PathPrefix = "" | "/direct";

export interface PathPrefixContextValue {
  prefix: PathPrefix;
  navigate: (to: string, options?: NavigateOptions) => void;
}

export const PathPrefixContext = createContext<PathPrefixContextValue | undefined>(undefined);
