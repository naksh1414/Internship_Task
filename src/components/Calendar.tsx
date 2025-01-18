import { useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Event,
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

const DnDCalendar = withDragAndDrop(BigCalendar);

interface CalendarEvent extends Event {
  id: string;
  interview: Interview;
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

      const updatedInterview: Interview = {
        ...currentInterview,
        date: updatedDate,
        time: updatedTime,
      };

      updateInterview(currentInterview.id, updatedInterview);

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

  return (
    <>
      <div className="h-screen bg-white p-4 rounded-lg shadow-md relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        <div className="mb-4 flex gap-4">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{type}</span>
            </div>
          ))}
        </div>
        <div className="p-4 h-full">
          <DnDCalendar
            localizer={localizer}
            events={events}
            defaultView="week"
            views={["month", "week", "day"]}
            step={60}
            timeslots={1}
            showMultiDayTimes
            onEventDrop={(args: any) => onEventChange(args)}
            onEventResize={(resizeInfo: any) => onEventChange(resizeInfo)}
            selectable
            resizable
            popup
            className="rounded-lg"
            eventPropGetter={eventStyleGetter}
            tooltipAccessor={(event: object) => {
              const calendarEvent = event as CalendarEvent;
              return `
                ${calendarEvent.interview.candidateName}
                Type: ${calendarEvent.interview.type}
                Interviewer: ${calendarEvent.interview.interviewerName}
                Date: ${
                  calendarEvent.start
                    ? format(calendarEvent.start, "MMM dd, yyyy")
                    : "N/A"
                }
                Time: ${
                  calendarEvent.start
                    ? format(calendarEvent.start, "HH:mm")
                    : "N/A"
                }
              `;
            }}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
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
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={handleConfirmReschedule}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
            <AlertDialogTitle>Schedule New Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to schedule an interview for{" "}
              {selectedSlot?.start &&
                format(selectedSlot.start, "MMM dd, yyyy 'at' HH:mm")}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowScheduleDialog(false)}>
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
