import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import React from "react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  data: Array<{ value: number }>;
  prefix?: string;
  suffix?: string;
}

export function KPICard({ title, value, change, data, prefix = "", suffix = "" }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <h3 className="text-3xl font-semibold mb-2">
              {prefix}{value}{suffix}
            </h3>
            <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
          <div className="w-24 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "#00C48C" : "#FF4D4F"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
