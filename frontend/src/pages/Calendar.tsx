import { useEffect, useRef, useState } from "react";
import type FullCalendar from "@fullcalendar/react";
import { useAuth } from "@clerk/react";
import axios from "axios";
import { Plus } from "lucide-react";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { NewTaskModal } from "../components/ui/dashboard/NewTaskModal";
import { CalendarToolbar } from "../components/ui/calendar/CalendarToolbar";
import { CalendarGrid } from "../components/ui/calendar/CalendarGrid";
import { CalendarDetailsPanel } from "../components/ui/calendar/CalendarDetailsPanel";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

interface taskType {
  id: string;
  user_id: string;
  title: string;
  details: string;
  due: string;
  type: string;
  created_at: Date;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Calendar() {
  const { userId, getToken } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [tasks, setTasks] = useState<taskType[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [viewTitle, setViewTitle] = useState("");
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const fetchTasksData = async () => {
    if (!userId) return;
    const token = await getToken();
    const result = await axios.get(`http://localhost:5000/tasks/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(result.data.tasks ?? []);
  };

  useEffect(() => {
    if (!userId) return;
    const loadTasks = async () => {
      const token = await getToken();
      const result = await axios.get(`http://localhost:5000/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(result.data.tasks ?? []);
    };
    loadTasks();
  }, [userId]);

  function changeView(view: CalendarView) {
    calendarRef.current?.getApi().changeView(view);
    setCurrentView(view);
  }

  return (
    <div className="flex h-screen bg-[#0b0b12]">
      <LeftSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <CalendarToolbar
          title={viewTitle}
          currentView={currentView}
          onPrev={() => calendarRef.current?.getApi().prev()}
          onNext={() => calendarRef.current?.getApi().next()}
          onToday={() => calendarRef.current?.getApi().today()}
          onChangeView={changeView}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <CalendarGrid
              ref={calendarRef}
              tasks={tasks}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onDatesSet={setViewTitle}
            />
          </div>
          <CalendarDetailsPanel selectedDate={selectedDate} tasks={tasks} />
        </div>
      </div>

      <button
        onClick={() => setIsNewTaskOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-violet-600/30 hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Add Task
      </button>

      <NewTaskModal
        open={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        initialDate={selectedDate}
        onTaskCreated={fetchTasksData}
      />
    </div>
  );
}
