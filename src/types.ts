export type InterviewType = "Technical" | "HR" | "Behavioral";

export interface Interview {
  id: string;
  candidateName: string;
  interviewerName: string;
  date: string;
  time: string;
  type: InterviewType;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
