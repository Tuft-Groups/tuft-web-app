import makeApiCall from "@/lib/api_wrapper";
import { useAppStore } from "@/store";
import { Analytics } from "@/types/globals";
import moment from "moment";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../ui/date-range-picker";
import { formatNumber } from "@/lib/utils";
import Loader from "../ui/loader";
import { AreaChart } from "../ui/area-chart";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel } from "@/components/ui/select";
import { SelectGroup } from "../ui/select";
import { Database, MessageSquare, Users } from "lucide-react";
import { BarChartComponent } from "../ui/bar-chart";
import { LineChartComponent } from "../ui/line-chart";

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({} as Analytics);
  const { selectedRoom } = useAppStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: moment().subtract(6, "months").startOf("month").toDate(),
    to: moment().toDate(),
  });
  const [groupBy, setGroupBy] = useState<"day" | "month">("month");

  useEffect(() => {
    setLoading(true);

    if (!dateRange?.from || !dateRange?.to) return;
    if (dateRange.from > dateRange.to) return;

    if (!selectedRoom?.is_admin && !selectedRoom?.is_analytics_public) return;

    makeApiCall({
      url: "/analytics",
      method: "GET",
      params: {
        room_id: selectedRoom?.id,
        start_date: dateRange?.from,
        end_date: dateRange?.to,
        time_frame: groupBy,
      },
    }).then((data) => {
      setAnalytics(data.data);
      setLoading(false);
    });
  }, [dateRange, groupBy]);

  return (
    <div className="max-w-[1200px] w-full h-full">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex gap-4 justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="flex gap-2">
            <DateRangePicker value={dateRange} onDateChange={(date) => setDateRange(date)} />
            <Select onValueChange={(value) => setGroupBy(value as "day" | "month")} value={groupBy}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Members" value={analytics.basic?.no_of_members} />
            <MetricCard title="Total Files" value={analytics.basic?.no_of_files} />
            <MetricCard title="Total Messages" value={analytics.basic?.no_of_messages} />
            <MetricCard title="Storage Used (GB)" value={analytics.basic?.storage_used} />
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader loading />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AreaChart
                  data={analytics.user_growth}
                  xAxisKey="date_formatted"
                  config={{
                    cumulative_users: {
                      color: "red",
                      label: "Users",
                      icon: Users,
                    },
                  }}
                  title="User Growth"
                  description="Number of new users added each day"
                />
                <LineChartComponent
                  data={analytics.active_users}
                  title="Active Users"
                  description="Number of active users over time"
                  xAxisKey="date_formatted"
                  yAxisKey="active_users"
                  config={{
                    active_users: {
                      color: "lime",
                      label: "Monthly Active Users",
                      icon: Users,
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BarChartComponent
                  data={analytics.messages}
                  config={{
                    messages: {
                      color: "purple",
                      label: "Messages",
                      icon: MessageSquare,
                    },
                  }}
                  xAxisKey="date_formatted"
                  yAxisKey="count"
                  title="Messages"
                  description="Number of messages sent"
                />
                <BarChartComponent
                  data={analytics.feed}
                  config={{
                    feed: {
                      color: "violet",
                      label: "Feed",
                      icon: MessageSquare,
                    },
                  }}
                  xAxisKey="date_formatted"
                  yAxisKey="count"
                  title="Feed"
                  description="Number of feed sent"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AreaChart
                  data={analytics.storage}
                  xAxisKey="date_formatted"
                  config={{
                    cumulative_storage_gb: {
                      color: "red",
                      label: "Storage Used",
                      icon: Database,
                    },
                  }}
                  title="Storage Used"
                  description="Storage used over time"
                />
                <LineChartComponent
                  data={analytics.bandwidth}
                  title="Bandwidth Used"
                  description="Bandwidth used over time"
                  xAxisKey="date_formatted"
                  yAxisKey="bandwidth_gb"
                  config={{
                    bandwidth: {
                      color: "lime",
                      label: "Bandwidth",
                      icon: Database,
                    },
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-2xl font-semibold">{formatNumber(value)}</span>
      </div>
    </div>
  );
}
