import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import AppSidebar from "@/components/AppSidebar";
import { SwipeableCarousel, SWIPEABLE_PATHS, SwipeContextProvider } from "@/layouts/SwipeableLayout";
import { TourOverlay } from "@/components/TourOverlay";

const ProtectedLayout = () => {
  const location = useLocation();

  // Check if current route is swipeable
  const isSwipeableRoute = SWIPEABLE_PATHS.has(location.pathname);

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

  const showSidebar = !shouldHideNav && !isSwipeableRoute;
  const containerWidth = isSwipeableRoute ? "max-w-4xl" : "max-w-6xl";
  const bottomPadding = shouldHideNav ? "pb-8" : "pb-24 md:pb-16";

  return (
    <SwipeContextProvider>
      <TourOverlay />
      {shouldHideNav ? (
        // Onboarding / fullscreen routes — no wrapper, no padding, no scroll
        <Outlet />
      ) : isSwipeableRoute ? (
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
            {showSidebar && <AppSidebar />}
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
          <NavigationBar />
        </div>
      )}
    </SwipeContextProvider>
  );
};

export default ProtectedLayout;
