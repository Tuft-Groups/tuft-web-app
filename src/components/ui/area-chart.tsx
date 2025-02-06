"use client";

import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AreaChartProps {
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
  xAxisKey: string;
  footer?: React.ReactNode;
}

export function AreaChart({ data, config, title, description, xAxisKey, footer }: AreaChartProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsAreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                {Object.entries(config).map(([key, value]) => (
                  <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={value.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={value.color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              {Object.keys(config).map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="natural"
                  fill={`url(#fill${key})`}
                  fillOpacity={0.4}
                  stroke={config[key].color}
                  stackId="a"
                />
              ))}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
