import { useMemo, useState, useEffect } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Event,
  View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addHours,
  isBefore,
  addDays,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useInterviewStore } from "../store/interviewStore";
import { Interview, InterviewType } from "../types";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
// import { EventTooltip } from "../components/ui/animated-tooltip";
import "../styles/calender.css";
const DnDCalendar = withDragAndDrop(BigCalendar);

interface CalendarEvent extends Event {
  id: string;
  interview: Interview & { changeType?: "date" | "time" | "both" };
}

interface EventInteractionArgs<T> {
  event: T;
  start: Date;
  end: Date;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    "en-US": enUS,
  },
});

const typeColors: Record<InterviewType, string> = {
  Technical: "#3b82f6",
  HR: "#10b981",
  Behavioral: "#8b5cf6",
};

const createLocalDate = (
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
) => {
  const date = new Date(year, month - 1, day);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export function Calendar() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    event: CalendarEvent;
    start: Date;
    end: Date;
    changeType: "date" | "time" | "both";
  } | null>(null);
  const [defaultView, setDefaultView] = useState<View>("week");
  const [isMobile, setIsMobile] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (isBefore(slotInfo.start, new Date())) {
      toast.error("Cannot schedule interviews in the past");
      return;
    }

    const overlappingInterview = checkForOverlap(
      slotInfo.start,
      slotInfo.end,
      "" // Empty string since there's no current event ID
    );

    if (overlappingInterview) {
      toast.error(
        `This time slot overlaps with ${overlappingInterview.interview.candidateName}'s interview`
      );
      return;
    }

    setSelectedSlot(slotInfo);
    setShowScheduleDialog(true);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setDefaultView(mobile ? "day" : "week");
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const interviews = useInterviewStore((state) => state.interviews);
  const updateInterview = useInterviewStore((state) => state.updateInterview);

  const events = useMemo(() => {
    return interviews.map((interview) => {
      const [year, month, day] = interview.date.split("-").map(Number);
      const [hours, minutes] = interview.time.split(":").map(Number);

      const eventDate = createLocalDate(year, month, day, hours, minutes);

      return {
        id: interview.id,
        title: `${interview.candidateName} - ${interview.type}`,
        start: eventDate,
        end: addHours(eventDate, 1),
        interview,
      };
    });
  }, [interviews]);

  const checkForOverlap = (start: Date, end: Date, currentEventId: string) => {
    return events.find((existingEvent) => {
      if (existingEvent.id === currentEventId) return false;
      const eventStart = existingEvent.start;
      const eventEnd = existingEvent.end;
      return (
        (start >= eventStart && start < eventEnd) ||
        (end > eventStart && end <= eventEnd) ||
        (start <= eventStart && end >= eventEnd)
      );
    });
  };

  const onEventChange = ({
    event,
    start: newStart,
    end: newEnd,
  }: EventInteractionArgs<CalendarEvent>) => {
    console.log("Original event start:", event.start);
    console.log("New start:", newStart);

    if (isBefore(newStart, new Date())) {
      toast.error("Cannot schedule interviews in the past");
      return;
    }

    const overlappingInterview = checkForOverlap(
      newStart,
      newEnd || addHours(newStart, 1),
      event.id
    );
    if (overlappingInterview) {
      toast.error(
        `This time slot overlaps with ${overlappingInterview.interview.candidateName}'s interview`
      );
      return;
    }

    // Compare only the relevant parts to determine the change type
    const originalStart = event.start;
    const sameTime =
      originalStart &&
      originalStart.getHours() === newStart.getHours() &&
      originalStart.getMinutes() === newStart.getMinutes();
    const sameDate =
      originalStart &&
      originalStart.getDate() === newStart.getDate() &&
      originalStart.getMonth() === newStart.getMonth() &&
      originalStart.getFullYear() === newStart.getFullYear();

    let changeType: "date" | "time" | "both" = "both";
    if (sameTime && !sameDate) changeType = "date";
    if (!sameTime && sameDate) changeType = "time";

    setPendingChange({
      event,
      start: newStart,
      end: newEnd || addHours(newStart, 1),
      changeType,
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmReschedule = async () => {
    if (!pendingChange) return;

    setIsLoading(true);
    try {
      const { event, start: newStart, changeType } = pendingChange;
      const currentInterview = event.interview;

      // Only adjust the date if we're actually changing the date
      const dateToUse = changeType === "time" ? newStart : addDays(newStart, 1);

      // When only changing time, use the original date with new time
      const updatedDate =
        changeType === "time"
          ? currentInterview.date
          : format(dateToUse, "yyyy-MM-dd");

      const updatedTime = format(newStart, "HH:mm");

      console.log("Saving with:", {
        changeType,
        originalDate: currentInterview.date,
        newStartDate: format(newStart, "yyyy-MM-dd"),
        updatedDate,
        updatedTime,
      });

      const updatedInterview: Interview & {changeType:"date"|"time"|"both"} = {
        ...currentInterview,
        date: updatedDate,
        time: updatedTime,
        changeType,
      };

      updateInterview(currentInterview.id, updatedInterview);
      console.log("Interview updated:", updatedInterview);

      const changeTypeText = {
        date: "date",
        time: "time",
        both: "date and time",
      }[changeType];

      toast.success(
        `Interview ${changeTypeText} with ${currentInterview.candidateName} updated successfully`
      );
      simulateNotification(updatedInterview);
    } catch (error) {
      toast.error("Failed to reschedule interview. Please try again.");
      console.error("Error rescheduling interview:", error);
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setPendingChange(null);
    }
  };

  const simulateNotification = (interview: Interview) => {
    console.log("Sending notification emails...", interview);
    setTimeout(() => {
      toast.success(
        <div>
          <p className="font-semibold">Notifications sent to:</p>
          <ul className="list-disc list-inside">
            <li>{interview.candidateName} (Candidate)</li>
            <li>{interview.interviewerName} (Interviewer)</li>
          </ul>
        </div>
      );
    }, 1000);
  };

  const eventStyleGetter = (event: object) => {
    const isUpcoming = (event as CalendarEvent).start
      ? (event as CalendarEvent).start &&
        isBefore(new Date(), (event as CalendarEvent).start as Date)
      : false;
    return {
      style: {
        backgroundColor: isUpcoming
          ? typeColors[(event as CalendarEvent).interview.type]
          : "#6b7280",
        opacity: isUpcoming ? 1 : 0.7,
      },
    };
  };

  // const CustomToolbar = (toolbar: any) => {
  //   const currentInterviews = events.filter((event) => {
  //     const eventDate = event.start;
  //     const today = new Date();
  //     return (
  //       eventDate &&
  //       eventDate.getDate() === today.getDate() &&
  //       eventDate.getMonth() === today.getMonth() &&
  //       eventDate.getFullYear() === today.getFullYear()
  //     );
  //   });

  //   const tooltipItems = currentInterviews.map((event) => ({
  //     title: event.interview.candidateName,
  //     interviewer: event.interview.interviewerName,
  //     candidate: event.interview.candidateName,
  //     time: event.start as Date,
  //     type: event.interview.type,
  //   }));

  //   return (
  //     <div className="rbc-toolbar">
  //       <span className="rbc-btn-group">
  //         <button onClick={() => toolbar.onNavigate("PREV")}>←</button>
  //         <button onClick={() => toolbar.onNavigate("TODAY")}>Today</button>
  //         <button onClick={() => toolbar.onNavigate("NEXT")}>→</button>
  //       </span>

  //       <span className="flex items-center justify-center gap-4 rbc-toolbar-label">
  //         {toolbar.label}
  //         {tooltipItems.length > 0 && (
  //           <div className="flex items-center gap-2">
  //             <span className="text-sm text-gray-500">Today's Interviews:</span>
  //             <EventTooltip items={tooltipItems} />
  //           </div>
  //         )}
  //       </span>

  //       <span className="rbc-btn-group">
  //         {!isMobile && (
  //           <button onClick={() => toolbar.onView("month")}>Month</button>
  //         )}
  //         <button onClick={() => toolbar.onView("week")}>Week</button>
  //         <button onClick={() => toolbar.onView("day")}>Day</button>
  //       </span>
  //     </div>
  //   );
  // };

  return (
    <>
      <div className="min-h-screen h-[calc(100vh-4rem)] md:h-screen bg-white p-2 md:p-4 rounded-lg shadow-md relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Legend - Responsive grid for type colors */}
        <div className="grid grid-cols-2 gap-2 p-2 mb-2 md:mb-4 md:flex md:flex-row md:gap-4">
          {Object.entries(typeColors).map(([type, color]) => (
            <div
              key={type}
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              <div
                className="w-3 h-3 rounded-full md:w-4 md:h-4"
                style={{ backgroundColor: color }}
              />
              <span>{type}</span>
            </div>
          ))}
        </div>

        {/* Calendar Container */}
        <div className="h-[calc(100%-3rem)] md:h-[calc(100%-4rem)] p-1 md:p-4 overflow-hidden">
          <DnDCalendar
            localizer={localizer}
            events={events}
            defaultView={defaultView}
            views={isMobile ? ["day", "week"] : ["month", "week", "day"]}
            step={60}
            timeslots={1}
            showMultiDayTimes
            onEventDrop={onEventChange}
            onEventResize={onEventChange}
            selectable
            resizable
            popup
            className="responsive-calendar"
            eventPropGetter={eventStyleGetter}
            onSelectSlot={handleSelectSlot}
            // components={{ toolbar: CustomToolbar }}
          />
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black" >Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the{" "}
              {pendingChange?.changeType === "both"
                ? "date and time"
                : pendingChange?.changeType}{" "}
              of the interview with{" "}
              {pendingChange?.event.interview.candidateName} to{" "}
              {pendingChange?.start.toLocaleString()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-black" disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={handleConfirmReschedule}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Schedule New Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to schedule an interview for{" "}
              {selectedSlot?.start &&
                format(selectedSlot.start, "MMM dd, yyyy 'at' HH:mm")}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-black "
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowScheduleDialog(false);
                // Navigate to the interview form page with the selected time
                const start = selectedSlot?.start;
                if (start) {
                  const date = format(start, "yyyy-MM-dd");
                  const time = format(start, "HH:mm");
                  window.location.href = `/new?date=${date}&time=${time}`;
                }
              }}
            >
              Schedule Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
