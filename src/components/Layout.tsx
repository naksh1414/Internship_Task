import { Link, Outlet } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";
import ScrollProgress from "../components/ui/scroll-progress";
export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollProgress className="top-[65px]" />
      <nav className="bg-white shadow-sm fixed z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-600"
              >
                <Calendar className="h-6 w-6 mr-2" />
                <span className="font-semibold">Interview Scheduler</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/new"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-gray-600"
              >
                <Plus className="h-5 w-5 mr-1" />
                New Interview
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl pt-[75px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
