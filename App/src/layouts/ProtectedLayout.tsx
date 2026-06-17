import { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import AppSidebar from "@/components/AppSidebar";
import MoreMenu from "@/components/MoreMenu";
import { SwipeableCarousel, SWIPEABLE_PATHS, SwipeContextProvider } from "@/layouts/SwipeableLayout";
import { TourOverlay } from "@/components/TourOverlay";

const ProtectedLayout = () => {
  const location = useLocation();

  // Check if current route is swipeable
  const isSwipeableRoute = SWIPEABLE_PATHS.has(location.pathname);

  // Desktop usa layout de app (sidebar + página), não o carousel de swipe (paradigma mobile).
  // Inicializa síncrono (matchMedia) pra não dar flash de layout no primeiro render.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const [moreOpen, setMoreOpen] = useState(false);

  const shouldHideNav = useMemo(() => {
    const hiddenRoutes = new Set(["/onboarding", "/onboarding-new", "/create", "/onboarding-v2"]);
    // Also hide for /habits/edit/:id routes
    const isEditHabitRoute = location.pathname.startsWith("/habits/edit/");
    // Session routes are fullscreen — no nav, no padding, no FAB
    const isSessionRoute =
      location.pathname === "/session" ||
      (location.pathname.includes("/journeys/") && location.pathname.endsWith("/session"));
    return hiddenRoutes.has(location.pathname) || isEditHabitRoute || isSessionRoute;
  }, [location.pathname]);

  // Carousel só no mobile para rotas swipeable. Desktop (e demais rotas) = sidebar + página.
  const useCarousel = isSwipeableRoute && !isDesktop;
  const containerWidth = isSwipeableRoute ? "max-w-5xl" : "max-w-6xl";
  const bottomPadding = shouldHideNav ? "pb-8" : "pb-24 md:pb-16";

  return (
    <SwipeContextProvider>
      <TourOverlay />
      {shouldHideNav ? (
        // Onboarding / fullscreen routes — no wrapper, no padding, no scroll
        <Outlet />
      ) : useCarousel ? (
        <div className="relative min-h-screen bg-background">
          <SwipeableCarousel />
          <NavigationBar />
        </div>
      ) : (
        <div className="relative min-h-screen bg-background">
          <div
            className={`mx-auto flex w-full ${containerWidth} flex-col gap-6 px-4 md:flex-row md:px-8 ${bottomPadding}`}
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
          >
            <AppSidebar onOpenMore={() => setMoreOpen(true)} />
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
          <NavigationBar />
          <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
        </div>
      )}
    </SwipeContextProvider>
  );
};

export default ProtectedLayout;
