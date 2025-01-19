import { useState } from "react";
import { parse, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Calendar, Search } from "lucide-react";
import { useInterviewStore } from "../store/interviewStore";
import { Interview } from "../types";
import { motion, AnimatePresence } from "framer-motion";

const listVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const getInterviewTypeColor = (type: Interview["type"]) => {
  switch (type) {
    case "Technical":
      return "bg-blue-100 text-blue-800";
    case "HR":
      return "bg-green-100 text-green-800";
    case "Behavioral":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function InterviewList() {
  const navigate = useNavigate();
  const interviews = useInterviewStore((state) => state.interviews);
  const deleteInterview = useInterviewStore((state) => state.deleteInterview);
  const [searchTerm, setSearchTerm] = useState("");
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      deleteInterview(id);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = format(new Date(interview.date), "PPpp").toLowerCase();

    return (
      interview.candidateName.toLowerCase().includes(searchLower) ||
      interview.interviewerName.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h2>
      <div className="relative w-full">
        <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Name or Date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full py-2 focus:border-none block sm:text-sm border-gray-300 rounded-md border-2"
        />
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <AnimatePresence>
          <motion.ul
            variants={listVariants}
            initial="initial"
            animate="animate"
            className="divide-y divide-gray-200"
          >
            {filteredInterviews.map((interview) => (
              <motion.li
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ scale: 1.01 }}
                key={interview.id}
                className="transform transition-all"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(interview.date), "PPpp")}
                      </p>

                      <p className="text-sm font-medium text-gray-900">
                        {format(
                          parse(interview.time, "HH:mm", new Date()),
                          "h:mm a"
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/edit/${interview.id}`)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(interview.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Candidate: {interview.candidateName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Interviewer: {interview.interviewerName}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInterviewTypeColor(
                          interview.type
                        )}`}
                      >
                        {interview.type}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
            {filteredInterviews.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                {interviews.length === 0
                  ? "No interviews scheduled yet."
                  : "No interviews match your search."}
              </li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
