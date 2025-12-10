import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  benchmark?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MetricCard = ({
  title,
  value,
  description,
  change,
  benchmark,
  icon,
  loading = false,
}: MetricCardProps) => {
  const getTrendIcon = () => {
    if (change === undefined || change === null) return null;
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return "text-gray-600";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {change !== undefined && change !== null && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(change)}% from last period</span>
              </div>
            )}
            {benchmark && (
              <p className="text-xs text-blue-600 mt-1 font-medium">{benchmark}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
