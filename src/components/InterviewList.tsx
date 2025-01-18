import { parse, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Calendar } from "lucide-react";
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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      deleteInterview(id);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <AnimatePresence>
          <motion.ul
            variants={listVariants}
            initial="initial"
            animate="animate"
            className="divide-y divide-gray-200"
          >
            {interviews.map((interview) => (
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
            {interviews.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No interviews scheduled yet.
              </li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
