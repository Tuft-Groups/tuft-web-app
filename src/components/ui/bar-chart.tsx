"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  config: ChartConfig;
  title: string;
  description?: string;
  footerText?: string;
  xAxisKey: string;
  yAxisKey: string;
}

export function BarChartComponent({ data, config, title, description, footerText, xAxisKey, yAxisKey }: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis dataKey={yAxisKey} tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={yAxisKey} fill={Object.values(config)[0]?.color as any} radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {footerText && <div className="leading-none text-muted-foreground">{footerText}</div>}
      </CardFooter>
    </Card>
  );
}
