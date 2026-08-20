import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import axios from "axios";
import { useAuth } from "@clerk/react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { API_BASE_URL } from "@/lib/api";

interface sessionType {
  id: string;
  created_at: string;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date) {
  const offset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

const chartConfig = {
  value: {
    label: "Sessions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StudyVelocityCard() {
  const { userId, getToken } = useAuth();
  const [sessions, setSessions] = useState<sessionType[]>([]);

  useEffect(() => {
    if (!userId) return;
    const loadSessions = async () => {
      const token = await getToken();
      const result = await axios.get(`${API_BASE_URL}/global/sessions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(result.data ?? []);
    };
    loadSessions();
  }, [userId, getToken]);

  const weekStart = startOfWeek(new Date());
  const todayIndex = (new Date().getDay() + 6) % 7;
  const counts = new Array(7).fill(0);
  for (const session of sessions) {
    const createdAt = new Date(session.created_at);
    const dayIndex = Math.floor((createdAt.getTime() - weekStart.getTime()) / 86400000);
    if (dayIndex >= 0 && dayIndex < 7) {
      counts[dayIndex] += 1;
    }
  }
  const chartData = dayLabels.map((day, i) => ({ day, value: counts[i] }));
  const maxValue = Math.max(...counts, 4);

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
            domain={[0, maxValue]}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={36}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {chartData.map((_, i) => (
              <Cell key={i} fill="var(--chart-1)" fillOpacity={i === todayIndex ? 1 : 0.55} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
