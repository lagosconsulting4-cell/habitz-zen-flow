import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface CohortData {
  cohort_week: string;
  cohort_size: number;
  day_1_retention_percent: number;
  day_7_retention_percent: number;
  day_30_retention_percent: number;
}

interface CohortTableProps {
  data: CohortData[];
  loading?: boolean;
}

export const CohortTable = ({ data, loading = false }: CohortTableProps) => {
  const getRetentionColor = (percent: number) => {
    if (percent >= 30) return "text-green-600 font-semibold";
    if (percent >= 20) return "text-yellow-600 font-medium";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>
            Retention rates by signup week. Benchmarks: D1 25-30%, D7 15-20%, D30 8-15%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cohort data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Retention Analysis</CardTitle>
        <CardDescription>
          Retention rates by signup week. Benchmarks: D1 25-30%, D7 15-20%, D30 8-15%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort Week</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Day 1</TableHead>
              <TableHead className="text-right">Day 7</TableHead>
              <TableHead className="text-right">Day 30</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cohort) => (
              <TableRow key={cohort.cohort_week}>
                <TableCell className="font-medium">
                  {format(new Date(cohort.cohort_week), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">{cohort.cohort_size}</TableCell>
                <TableCell className={`text-right ${getRetentionColor(cohort.day_1_retention_percent)}`}>
                  {cohort.day_1_retention_percent}%
                </TableCell>
                <TableCell className={`text-right ${getRetentionColor(cohort.day_7_retention_percent)}`}>
                  {cohort.day_7_retention_percent}%
                </TableCell>
                <TableCell className={`text-right ${getRetentionColor(cohort.day_30_retention_percent)}`}>
                  {cohort.day_30_retention_percent}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
