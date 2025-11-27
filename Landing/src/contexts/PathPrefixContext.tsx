import { createContext, useContext, ReactNode } from "react";
import { useNavigate as useRouterNavigate, NavigateOptions } from "react-router-dom";

interface PathPrefixContextValue {
  prefix: "" | "/direct";
  navigate: (to: string, options?: NavigateOptions) => void;
}

const PathPrefixContext = createContext<PathPrefixContextValue | undefined>(undefined);

export function PathPrefixProvider({
  children,
  prefix
}: {
  children: ReactNode;
  prefix: "" | "/direct"
}) {
  const routerNavigate = useRouterNavigate();

  const navigate = (to: string, options?: NavigateOptions) => {
    routerNavigate(prefix + to, options);
  };

  return (
    <PathPrefixContext.Provider value={{ prefix, navigate }}>
      {children}
    </PathPrefixContext.Provider>
  );
}

export function usePathAwareNavigate() {
  const context = useContext(PathPrefixContext);
  if (!context) {
    throw new Error("usePathAwareNavigate must be used within PathPrefixProvider");
  }
  return context.navigate;
}

export function usePathPrefix() {
  const context = useContext(PathPrefixContext);
  if (!context) {
    throw new Error("usePathPrefix must be used within PathPrefixProvider");
  }
  return context.prefix;
}
