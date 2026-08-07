import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { day: "Mon", value: 38 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 28 },
  { day: "Thu", value: 62 },
  { day: "Fri", value: 48 },
  { day: "Sat", value: 92 },
  { day: "Sun", value: 15 },
];

const chartConfig = {
  value: {
    label: "Study minutes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StudyVelocityCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121a] p-5">
      <h2 className="text-xs font-semibold tracking-wide text-zinc-400">
        STUDY VELOCITY — WEEKLY PROGRESS
      </h2>

      <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-56 w-full">
        <BarChart data={chartData} margin={{ left: -20 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={36}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
            <Cell fill="var(--chart-1)" fillOpacity={1} />
            <Cell fill="var(--chart-1)" fillOpacity={0.55} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
