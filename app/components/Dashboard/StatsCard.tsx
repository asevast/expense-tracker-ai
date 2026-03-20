"use client";

import { ReactNode } from "react";
import { Card } from "@/app/components/ui/Card";
import { cn } from "@/app/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("flex items-center gap-4", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-primary-600">{title}</p>
        <p className="text-2xl font-bold text-primary-900">{value}</p>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}% from last month
          </p>
        )}
      </div>
    </Card>
  );
}
