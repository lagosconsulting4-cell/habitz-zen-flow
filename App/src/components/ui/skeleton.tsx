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

export {
  Skeleton,
  HabitCardSkeleton,
  XPBarSkeleton,
  RoutineCardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  AnalyticsSkeleton,
};
