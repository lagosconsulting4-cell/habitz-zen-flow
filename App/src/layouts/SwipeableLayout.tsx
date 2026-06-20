import { createContext, useContext, useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MyHabits = lazy(() => import("@/pages/MyHabits"));
const JourneyHub = lazy(() => import("@/pages/JourneyHub"));
const Progress = lazy(() => import("@/pages/Progress"));
const Profile = lazy(() => import("@/pages/Profile"));

// Route to index mapping (Create is excluded - it's a modal overlay)
export const SWIPEABLE_ROUTES = [
  { path: "/dashboard", index: 0 },
  { path: "/progress",  index: 1 },
  { path: "/journeys",  index: 2 },
  { path: "/profile",   index: 3 },
] as const;

export const SWIPEABLE_PATHS = new Set(SWIPEABLE_ROUTES.map(r => r.path));

// Context for sharing swipe state
interface SwipeContextType {
  currentIndex: number;
  navigateTo: (index: number) => void;
  isSwipeable: boolean;
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
}

const SwipeContext = createContext<SwipeContextType>({
  currentIndex: 0,
  navigateTo: () => {},
  isSwipeable: false,
  emblaRef: () => {},
});

export const useSwipeNavigation = () => useContext(SwipeContext);

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

interface SwipeContextProviderProps {
  children: React.ReactNode;
}

// Context Provider - wraps everything and manages swipe state
export const SwipeContextProvider = ({ children }: SwipeContextProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);
  const isSwipingRef = useRef(false);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Check if current route is swipeable
  const currentRouteConfig = SWIPEABLE_ROUTES.find(r => r.path === location.pathname);
  const isSwipeable = !!currentRouteConfig;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    startIndex: currentRouteConfig?.index ?? 0,
    watchDrag: isSwipeable,
    containScroll: 'keepSnaps',
    duration: 40,
    dragThreshold: 10,
  });

  const [currentIndex, setCurrentIndex] = useState(currentRouteConfig?.index ?? 0);

  // Handle carousel select event - update URL when user swipes
  // Uses pathnameRef instead of location.pathname to keep the callback stable
  // and prevent event handler re-registration during multi-page swipes
  const onSelect = useCallback(() => {
    if (!emblaApi || isNavigatingRef.current) return;

    const index = emblaApi.selectedScrollSnap();
    setCurrentIndex(index);

    // Update URL to match carousel position
    const route = SWIPEABLE_ROUTES.find(r => r.index === index);
    if (route && route.path !== pathnameRef.current) {
      navigate(route.path, { replace: true });
    }
  }, [emblaApi, navigate]);

  // Subscribe to embla events
  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => { isSwipingRef.current = true; };

    // On pointer release: immediately update nav and URL before animation completes
    const onPointerUp = () => {
      if (isNavigatingRef.current) return;
      const index = emblaApi.selectedScrollSnap();
      setCurrentIndex(index);
      const route = SWIPEABLE_ROUTES.find(r => r.index === index);
      if (route && route.path !== pathnameRef.current) {
        navigate(route.path, { replace: true });
      }
    };

    const onSettle = () => {
      isNavigatingRef.current = false;
      isSwipingRef.current = false;
      // Safety net: ensure currentIndex is always in sync after animation
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    emblaApi.on("select", onSelect);
    emblaApi.on("settle", onSettle);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      emblaApi.off("select", onSelect);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, onSelect, navigate]);

  // Sync carousel with URL when location changes externally (browser back, direct URL)
  // Skips when user is actively swiping to avoid race condition with onPointerUp
  useEffect(() => {
    if (!emblaApi || !currentRouteConfig) return;
    if (isSwipingRef.current) return;

    const targetIndex = currentRouteConfig.index;
    const currentCarouselIndex = emblaApi.selectedScrollSnap();

    if (currentCarouselIndex !== targetIndex) {
      isNavigatingRef.current = true;
      emblaApi.scrollTo(targetIndex);
      setCurrentIndex(targetIndex);
      // isNavigatingRef is reset by the 'settle' event listener
    }
  }, [emblaApi, currentRouteConfig]);

  // Navigate to specific index
  const navigateTo = useCallback((index: number) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(8);
    }

    const route = SWIPEABLE_ROUTES.find(r => r.index === index);
    if (!route) return;

    setCurrentIndex(index); // Update state immediately to sync bottom nav
    if (emblaApi) {
      isNavigatingRef.current = true;
      emblaApi.scrollTo(index); // Animate immediately, same frame as the tap
    }
    navigate(route.path, { replace: true });
  }, [emblaApi, navigate]);

  return (
    <SwipeContext.Provider value={{ currentIndex, navigateTo, isSwipeable, emblaRef }}>
      {children}
    </SwipeContext.Provider>
  );
};

// Carousel component - renders the swipeable pages
export const SwipeableCarousel = () => {
  const { emblaRef } = useSwipeNavigation();

  return (
    <div className="overflow-hidden w-full h-dvh" ref={emblaRef}>
      <div className="flex h-full">
        {/* Slide 0: Hoje (hábitos do dia) */}
        <div className={cn("min-w-0 shrink-0 grow-0 basis-full overflow-y-auto overflow-x-hidden h-full will-change-transform")}>
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        </div>

        {/* Slide 1: Progresso */}
        <div className={cn("min-w-0 shrink-0 grow-0 basis-full overflow-y-auto overflow-x-hidden h-full will-change-transform")}>
          <Suspense fallback={<PageLoader />}>
            <Progress />
          </Suspense>
        </div>

        {/* Slide 2: Jornadas */}
        <div className={cn("min-w-0 shrink-0 grow-0 basis-full overflow-y-auto overflow-x-hidden h-full will-change-transform")}>
          <Suspense fallback={<PageLoader />}>
            <JourneyHub />
          </Suspense>
        </div>

        {/* Slide 3: Perfil */}
        <div className={cn("min-w-0 shrink-0 grow-0 basis-full overflow-y-auto overflow-x-hidden h-full will-change-transform")}>
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

// Legacy exports
export const SwipeProvider = SwipeContextProvider;
export const SwipeableLayout = SwipeContextProvider;
export default SwipeContextProvider;
