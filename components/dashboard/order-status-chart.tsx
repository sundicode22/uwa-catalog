"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DashboardOrderStatusPoint } from "@/types/domain"

const chartConfig = {
  pending: { label: "Pending", color: "var(--chart-2)" },
  confirmed: { label: "Confirmed", color: "var(--chart-1)" },
  fulfilled: { label: "Fulfilled", color: "var(--chart-3)" },
  cancelled: { label: "Cancelled", color: "var(--chart-5)" },
} satisfies ChartConfig

interface OrderStatusChartProps {
  data: DashboardOrderStatusPoint[]
  isLoading?: boolean
}

export function OrderStatusChart({ data, isLoading }: OrderStatusChartProps) {
  const hasData = data.some((point) => point.count > 0)

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Order status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
        ) : !hasData ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto h-[220px] w-full max-w-[280px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={52}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={`var(--color-${entry.status})`}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((point) => (
                <div
                  key={point.status}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `var(--color-${point.status})`,
                      }}
                    />
                    <span className="capitalize text-muted-foreground">
                      {point.status}
                    </span>
                  </div>
                  <span className="font-medium tabular-nums">{point.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
