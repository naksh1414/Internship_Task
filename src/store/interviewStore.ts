import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Interview } from "../types";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { parse, format } from "date-fns";

interface InterviewStore {
  interviews: Interview[];
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, interview: Interview) => void;
  deleteInterview: (id: string) => void;
  getInterviewById: (id: string) => Interview | undefined;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      interviews: [],

      addInterview: (interview) => {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Convert date to UTC while preserving the date portion only
        const dateOnly = new Date(interview.date);
        dateOnly.setHours(0, 0, 0, 0);
        const utcDate = zonedTimeToUtc(dateOnly, userTimeZone);

        // Convert time to UTC while preserving the time portion only
        const timeOnly = parse(interview.time, "HH:mm", new Date());
        const utcTime = zonedTimeToUtc(timeOnly, userTimeZone);
        const formattedTime = format(utcTime, "HH:mm");

        set((state) => ({
          interviews: [
            ...state.interviews,
            {
              ...interview,
              date: utcDate.toISOString().split("T")[0], // Store date as YYYY-MM-DD
              time: formattedTime, // Store time as HH:mm
            },
          ],
        }));
      },

      updateInterview: (id, updatedInterview) => {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Convert date and time to UTC
        const dateOnly = new Date(updatedInterview.date);
        if (
          updatedInterview.changeType === "date" ||
          updatedInterview.changeType === "both"
        ) {
          dateOnly.setHours(0, 0, 0, 0);
        }
        const utcDate = zonedTimeToUtc(dateOnly, userTimeZone);

        const timeOnly = parse(updatedInterview.time, "HH:mm", new Date());
        const utcTime = zonedTimeToUtc(timeOnly, userTimeZone);
        const formattedTime = format(utcTime, "HH:mm");

        set((state) => ({
          interviews: state.interviews.map((interview) =>
            interview.id === id
              ? {
                  ...updatedInterview,
                  date: utcDate.toISOString().split("T")[0],
                  time: formattedTime,
                }
              : interview
          ),
        }));
      },

      deleteInterview: (id) =>
        set((state) => ({
          interviews: state.interviews.filter(
            (interview) => interview.id !== id
          ),
        })),

      getInterviewById: (id) => {
        const state = get();
        const interview = state.interviews.find(
          (interview) => interview.id === id
        );

        if (interview) {
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          // Convert stored UTC date back to user's timezone
          const zonedDate = utcToZonedTime(
            new Date(interview.date),
            userTimeZone
          );
          const zonedTime = parse(interview.time, "HH:mm", new Date());
          zonedTime.setFullYear(1970, 0, 1); // Use a fixed date for time conversion
          const localTime = utcToZonedTime(zonedTime, userTimeZone);

          return {
            ...interview,
            date: format(zonedDate, "yyyy-MM-dd"),
            time: format(localTime, "HH:mm"),
          };
        }

        return undefined;
      },
    }),
    {
      name: "interview-store",
    }
  )
);
