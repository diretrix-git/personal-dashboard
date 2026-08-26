import { useApi } from '../hooks/useApi';
import { isBefore, addDays, parseISO, format } from 'date-fns';
import { Calendar, FileText, BellRing, Sparkles } from 'lucide-react';

const Home = () => {
  const { data: subs, loading: loadingSubs } = useApi('/subscriptions');
  const { data: assignments, loading: loadingAssignments } = useApi('/assignments');

  if (loadingSubs || loadingAssignments) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading your dashboard...
      </div>
    );
  }

  const now = new Date();
  const nextWeek = addDays(now, 7);

  // Filter and format subscriptions
  const upcomingSubs = (subs || [])
    .filter(sub => {
      const date = parseISO(sub.renewalDate);
      return isBefore(now, date) && isBefore(date, nextWeek);
    })
    .map(sub => ({
      ...sub,
      type: 'subscription',
      date: parseISO(sub.renewalDate),
      title: sub.name,
      subtitle: `${sub.currency} ${sub.cost} (${sub.billingCycle})`,
      icon: Calendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    }));

  // Filter and format assignments
  const upcomingAssignments = (assignments || [])
    .filter(task => {
      if (task.status === 'done') return false;
      const date = parseISO(task.dueDate);
      return isBefore(now, date) && isBefore(date, nextWeek);
    })
    .map(task => ({
      ...task,
      type: 'assignment',
      date: parseISO(task.dueDate),
      title: task.taskTitle,
      subtitle: `${task.courseName} - ${task.status}`,
      icon: FileText,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200'
    }));

  // Combine and sort
  const upcomingItems = [...upcomingSubs, ...upcomingAssignments].sort((a, b) => a.date - b.date);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-slate-500 mt-1">Here's what's happening this week.</p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-yellow-400" />
            Upcoming in 7 Days
          </h3>
          <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {upcomingItems.length} {upcomingItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="p-6">
          {upcomingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Sparkles className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">You're all caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No upcoming renewals or due dates this week.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={`${item.type}-${item._id}-${idx}`} className={`relative p-5 rounded-xl border ${item.border} bg-white shadow-sm hover:shadow-md transition-shadow group`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {format(item.date, 'MMM do')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* We can add quick stats here later (e.g. Total Subscriptions, Total Tasks, Monthly Expenses) */}
      </div>
    </div>
  );
};

export default Home;
