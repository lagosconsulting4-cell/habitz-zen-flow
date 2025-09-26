import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import MoreMenu from "@/components/MoreMenu";
import AppSidebar from "@/components/AppSidebar";

const ProtectedLayout = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const shouldHideNav = useMemo(() => {
    const hiddenRoutes = new Set(["/onboarding"]);
    return hiddenRoutes.has(location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-background">
      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />

      <div className={`mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-4 md:flex-row md:px-8 ${shouldHideNav ? "pb-8" : "pb-24 md:pb-16"}`}>
        {!shouldHideNav && <AppSidebar onOpenMore={() => setMoreOpen(true)} />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {!shouldHideNav && <NavigationBar onOpenMore={() => setMoreOpen(true)} />}
    </div>
  );
};

export default ProtectedLayout;

