"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartProps {
  data: any[];
  title: string;
  description?: string;
  xAxisKey: string;
  yAxisKey: string;
  config: ChartConfig;

  footerText?: string;
}

export function LineChartComponent({
  data,
  title,
  description,
  xAxisKey,
  yAxisKey,
  config,
  footerText,
}: LineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart
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
            <Line
              dataKey={yAxisKey}
              type="natural"
              stroke={Object.values(config)[0]?.color as any}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {footerText && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {footerText && <div className="leading-none text-muted-foreground">{footerText}</div>}
        </CardFooter>
      )}
    </Card>
  );
}
