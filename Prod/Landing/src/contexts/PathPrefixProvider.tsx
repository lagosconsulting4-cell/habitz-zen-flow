import { type ReactNode } from "react";
import { useNavigate as useRouterNavigate, type NavigateOptions } from "react-router-dom";

import { PathPrefixContext, type PathPrefix } from "@/contexts/path-prefix-context";

interface PathPrefixProviderProps {
  children: ReactNode;
  prefix: PathPrefix;
}

export const PathPrefixProvider = ({ children, prefix }: PathPrefixProviderProps) => {
  const routerNavigate = useRouterNavigate();

  const navigate = (to: string, options?: NavigateOptions) => {
    routerNavigate(prefix + to, options);
  };

  return (
    <PathPrefixContext.Provider value={{ prefix, navigate }}>
      {children}
    </PathPrefixContext.Provider>
  );
};
