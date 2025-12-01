import { Heart } from "lucide-react";

export const HealthIntegrationAlert: React.FC = () => (
  <div className="mx-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
    <div className="mt-0.5 flex-shrink-0">
      <Heart
        className="h-5 w-5 text-red-600 dark:text-red-400"
        fill="currentColor"
      />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900 dark:text-red-200">
        This task uses data from the Health app.
      </p>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300">
        Please grant Streaks permission if prompted.
      </p>
    </div>
  </div>
);
