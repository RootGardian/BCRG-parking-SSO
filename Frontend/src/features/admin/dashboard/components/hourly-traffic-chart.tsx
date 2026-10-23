"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HourlyTrafficData } from "../types";

interface HourlyTrafficChartProps {
  data?: HourlyTrafficData[];
  isLoading?: boolean;
}

/**
 * Composant de graphique d'affluence des flux par tranche horaire (HourlyTrafficChart).
 *
 * Utilise Recharts pour représenter les volumes d'entrées et de sorties au cours de la journée.
 */
export function HourlyTrafficChart({
  data,
  isLoading,
}: HourlyTrafficChartProps) {
  if (isLoading || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Flux d'Affluence Horaires (Entrées / Sorties)</span>
          <span className="text-xs font-normal text-muted-foreground">
            Données du jour en temps réel
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="heure"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey="entrees"
                name="Entrées"
                fill="#1d433b"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="sorties"
                name="Sorties"
                fill="#b49c10"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
