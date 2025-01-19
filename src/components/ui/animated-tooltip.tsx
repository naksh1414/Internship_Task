import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Clock, UserCircle, Calendar as CalendarIcon } from "lucide-react";

interface EventTooltipProps {
    items: {
    title: string;
    type: string;
    interviewer: string;
    date: string;
    time: string;
  };
}

export const EventTooltip = ({ items }: EventTooltipProps) => {
  const x = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 5 };

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-15, 15]),
    springConfig
  );

  const translateX = useSpring(
    useTransform(x, [-100, 100], [-25, 25]),
    springConfig
  );

  const getTypeColor = (type: string) => {
    const colors = {
      Technical: "border-blue-500",
      HR: "border-emerald-500",
      Behavioral: "border-purple-500",
    };
    return colors[type as keyof typeof colors] || "border-gray-500";
  };

  const getTypeBg = (type: string) => {
    const colors = {
      Technical: "bg-blue-500/10 text-blue-500",
      HR: "bg-emerald-500/10 text-emerald-500",
      Behavioral: "bg-purple-500/10 text-purple-500",
    };
    return (
      colors[type as keyof typeof colors] || "bg-gray-500/10 text-gray-500"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 10,
        },
      }}
      style={{ translateX, rotate }}
      className={`absolute z-50 w-72 -translate-x-1/2 -translate-y-full p-2 
          bg-white rounded-lg shadow-xl border-l-4 ${getTypeColor(items.type)} 
          -mt-2`}
    >
      {/* Header with type badge */}
      <div className="flex items-start justify-between p-2">
        <h3 className="font-medium text-lg text-gray-900">{items.title}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBg(
            items.type
          )}`}
        >
          {items.type}
        </span>
      </div>

      {/* Content with icons */}
      <div className="p-2 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <UserCircle className="h-4 w-4" />
          <span>
            Interviewer:{" "}
            <span className="font-medium">{items.interviewer}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Date: <span className="font-medium">{items.date}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            Time: <span className="font-medium">{items.time}</span>
          </span>
        </div>
      </div>

      {/* Footer divider and shine effect */}
      <div className="relative mt-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
};
