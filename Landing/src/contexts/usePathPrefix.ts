import { useContext } from "react";

import { PathPrefixContext } from "@/contexts/path-prefix-context";

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
