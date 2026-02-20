import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        // Shimmer animation
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

// Habit card skeleton - matches DashboardHabitCard structure
function HabitCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full aspect-square flex flex-col items-center justify-center gap-2 p-2",
        "bg-card rounded-3xl border border-border/60",
        "dark:bg-muted/5 dark:border-border/20",
        className
      )}
    >
      {/* Streak badge skeleton */}
      <div className="absolute top-2.5 right-2.5">
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>

      {/* Progress ring skeleton */}
      <div className="relative mb-1 w-[116px] h-[116px] flex items-center justify-center">
        {/* Outer ring */}
        <Skeleton className="absolute inset-0 rounded-full" />
        {/* Inner icon circle */}
        <Skeleton className="w-14 h-14 rounded-full z-10" />
      </div>

      {/* Name skeleton */}
      <Skeleton className="h-3 w-20 rounded-sm" />
    </div>
  );
}

// XP Bar skeleton
function XPBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        "bg-card border border-border/60",
        "dark:bg-muted/5 dark:border-border/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <Skeleton className="w-12 h-12 rounded-xl" />
        {/* XP text and bar */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <Skeleton className="h-3 w-16 rounded-sm" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Routine card skeleton
function RoutineCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        "bg-card border border-border/60",
        "dark:bg-muted/5 dark:border-border/20",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
        {/* Progress bar */}
        <Skeleton className="h-2 w-full rounded-full" />
        {/* Period pills */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Dashboard full loading skeleton
function DashboardSkeleton() {
  return (
    <div className="flex-1 px-4 pt-6 pb-32 space-y-6 animate-in fade-in duration-300">
      {/* XP Bar */}
      <XPBarSkeleton />

      {/* Routine Card */}
      <RoutineCardSkeleton />

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <HabitCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Table skeleton for admin pages
function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex gap-4 pb-3 border-b">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Analytics loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={`kpi-${i}`} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Chart placeholders */}
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

// Journey Hub loading skeleton
function JourneyHubSkeleton() {
  return (
    <div className="px-4 pt-6 pb-32 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-32 rounded-sm" />
        <Skeleton className="h-4 w-56 rounded-sm" />
      </div>
      {/* Active journey card */}
      <div className="rounded-2xl border border-border/60 p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 rounded-sm" />
            <Skeleton className="h-3 w-28 rounded-sm" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Catalog cards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36 rounded-sm" />
              <Skeleton className="h-3 w-48 rounded-sm" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Journey Day loading skeleton
function JourneyDaySkeleton() {
  return (
    <div className="pb-32 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 flex justify-between">
        <Skeleton className="h-4 w-16 rounded-sm" />
        <Skeleton className="h-4 w-24 rounded-sm" />
      </div>
      {/* Card */}
      <div className="mx-4 mt-2 rounded-2xl border border-border/60 overflow-hidden">
        <Skeleton className="h-1.5 w-full" />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48 rounded-sm" />
              <Skeleton className="h-3 w-28 rounded-sm" />
            </div>
          </div>
          {/* Content lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
            <Skeleton className="h-4 w-4/5 rounded-sm" />
            <div className="h-3" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-3/4 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Journey Detail loading skeleton
function JourneyDetailSkeleton() {
  return (
    <div className="pb-32 animate-in fade-in duration-300">
      <div className="px-4 pt-4 pb-6 space-y-4">
        <Skeleton className="h-4 w-16 rounded-sm" />
        <div className="flex items-start gap-4">
          <Skeleton className="w-24 h-24 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48 rounded-sm" />
            <Skeleton className="h-4 w-36 rounded-sm" />
            <Skeleton className="h-3 w-24 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* Timeline */}
      <div className="px-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-2 pb-4">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress page loading skeleton
function ProgressSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-navbar transition-colors duration-300">
      <div className="container mx-auto px-4 pb-6 max-w-4xl animate-in fade-in duration-300"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-40 rounded-sm" />
          <Skeleton className="h-4 w-64 rounded-sm" />
        </div>
        {/* Hero Card */}
        <div className="rounded-2xl border border-border/60 p-6 space-y-4 mb-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-32 rounded-sm" />
              <Skeleton className="h-4 w-48 rounded-sm" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </div>
        {/* Resumo Semanal */}
        <div className="rounded-2xl border border-border/60 p-6 space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28 rounded-sm" />
            <Skeleton className="h-4 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-16 rounded-sm" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-48 rounded-sm" />
        </div>
        {/* Chart */}
        <div className="rounded-2xl border border-border/60 p-6 space-y-4 mb-8">
          <Skeleton className="h-5 w-40 rounded-sm" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
        {/* Sparkline */}
        <div className="rounded-2xl border border-border/60 p-6 space-y-4 mb-8">
          <Skeleton className="h-5 w-44 rounded-sm" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        {/* Streaks */}
        <div className="rounded-2xl border border-border/60 p-6 space-y-3 mb-8">
          <Skeleton className="h-5 w-44 rounded-sm" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-sm" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  HabitCardSkeleton,
  XPBarSkeleton,
  RoutineCardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  AnalyticsSkeleton,
  JourneyHubSkeleton,
  JourneyDaySkeleton,
  JourneyDetailSkeleton,
  ProgressSkeleton,
};
