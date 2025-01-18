import { useState } from 'react';
import { Calendar } from '../components/Calendar';
import { InterviewList } from '../components/InterviewList';
import { LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export function Dashboard() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-md ${
              view === 'calendar'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${
              view === 'list'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {view === 'calendar' ? <Calendar /> : <InterviewList />}
      <Toaster position="bottom-right" />
    </div>
  );
}