import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import AppSidebar from "@/components/AppSidebar";
import { SwipeableCarousel, SWIPEABLE_PATHS, SwipeContextProvider } from "@/layouts/SwipeableLayout";

const ProtectedLayout = () => {
  const location = useLocation();

  // Check if current route is swipeable
  const isSwipeableRoute = SWIPEABLE_PATHS.has(location.pathname);

  const shouldHideNav = useMemo(() => {
    const hiddenRoutes = new Set(["/onboarding", "/onboarding-new", "/create"]);
    // Also hide for /habits/edit/:id routes
    const isEditHabitRoute = location.pathname.startsWith("/habits/edit/");
    return hiddenRoutes.has(location.pathname) || isEditHabitRoute;
  }, [location.pathname]);

  const showSidebar = !shouldHideNav && !isSwipeableRoute;
  const containerWidth = isSwipeableRoute ? "max-w-4xl" : "max-w-6xl";
  const bottomPadding = shouldHideNav ? "pb-8" : "pb-24 md:pb-16";

  return (
    <SwipeContextProvider>
      <div className="relative min-h-screen bg-background">
        {isSwipeableRoute ? (
          // Swipeable routes use the carousel
          <SwipeableCarousel />
        ) : (
          // Non-swipeable routes use traditional layout with Outlet
          <div className={`mx-auto flex w-full ${containerWidth} flex-col gap-6 px-4 pt-4 md:flex-row md:px-8 ${bottomPadding}`}>
            {showSidebar && <AppSidebar />}
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        )}

        {!shouldHideNav && <NavigationBar />}
      </div>
    </SwipeContextProvider>
  );
};

export default ProtectedLayout;
