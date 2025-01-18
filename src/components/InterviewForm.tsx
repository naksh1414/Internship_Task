import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, User, Users, Tag } from "lucide-react";
import { Interview, InterviewType } from "../types";
import { useInterviewStore } from "../store/interviewStore";
interface InterviewFormProps {
  initialData?: Interview;
  isEditing?: boolean;
}

export function InterviewForm({
  initialData,
  isEditing = false,
}: InterviewFormProps) {
  const navigate = useNavigate();
  const addInterview = useInterviewStore((state) => state.addInterview);
  const updateInterview = useInterviewStore((state) => state.updateInterview);
  const [searchParams] = useState(
    () => new URLSearchParams(window.location.search)
  );

  // Access the parameters
  const date = searchParams.get("date"); // "2025-01-21"
  const time = searchParams.get("time"); // "02:00"
  console.log(date, time);
  const [formData, setFormData] = useState<Partial<Interview>>(
    initialData || {
      candidateName: "",
      interviewerName: "",
      date: date || "",
      time: time || "",
      type: "Technical" as InterviewType,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const interview = {
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
    } as Interview;

    if (isEditing) {
      updateInterview(interview.id, interview);
    } else {
      addInterview(interview);
    }

    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isEditing ? "Edit Interview" : "Schedule New Interview"}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-lg font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <User className="h-4 w-4 mr-1" />
              Candidate Name
            </div>
            <input
              type="text"
              required
              value={formData.candidateName}
              onChange={(e) =>
                setFormData({ ...formData, candidateName: e.target.value })
              }
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Users className="h-4 w-4 mr-1" />
              Interviewer Name
            </div>
            <input
              type="text"
              required
              value={formData.interviewerName}
              onChange={(e) =>
                setFormData({ ...formData, interviewerName: e.target.value })
              }
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Clock className="h-4 w-4 mr-1" />
              Date
            </div>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Clock className="h-4 w-4 mr-1" />
              Time
            </div>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Tag className="h-4 w-4 mr-1" />
              Interview Type
            </div>
            <select
              required
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as InterviewType,
                })
              }
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Behavioral">Behavioral</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
        >
          {isEditing ? "Update Interview" : "Schedule Interview"}
        </button>
      </div>
    </form>
  );
}
