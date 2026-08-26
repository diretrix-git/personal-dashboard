import { useApi } from '../hooks/useApi';
import { isBefore, addDays, parseISO, format } from 'date-fns';
import { Calendar, FileText, BellRing, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const { data: subs, loading: loadingSubs } = useApi('/subscriptions');
  const { data: assignments, loading: loadingAssignments } = useApi('/assignments');

  if (loadingSubs || loadingAssignments) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
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
      color: 'text-primary-600',
      bg: 'bg-primary-50',
      border: 'border-primary-100'
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
      color: 'text-accent-500',
      bg: 'bg-orange-50',
      border: 'border-orange-100'
    }));

  // Combine and sort
  const upcomingItems = [...upcomingSubs, ...upcomingAssignments].sort((a, b) => a.date - b.date);

  return (
    <div className="space-y-6">
      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">Overview</h2>
        <p className="text-stone-500 mt-2 font-medium text-lg">Here's what's happening this week.</p>
      </header>

      <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 overflow-hidden">
        <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-accent-500" />
            Upcoming in 7 Days
          </h3>
          <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-lg">
            {upcomingItems.length} {upcomingItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="p-6 md:p-8">
          {upcomingItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center bg-stone-50/50 rounded-2xl border border-dashed border-stone-200"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-400" />
              </div>
              <p className="text-stone-800 font-bold text-lg">You're all caught up!</p>
              <p className="text-stone-500 font-medium mt-1">No upcoming renewals or due dates this week.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {upcomingItems.map((item, idx) => {
                const Icon = item.icon;
                const isFirst = idx === 0;

                if (isFirst) {
                   return (
                     <motion.div 
                       key={`${item.type}-${item._id}-${idx}`}
                       variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                       className="col-span-1 md:col-span-2 lg:col-span-2 relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl shadow-primary-900/20 overflow-hidden group"
                     >
                       <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                       
                       <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                         <div className="flex justify-between items-start mb-6">
                           <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-inner">
                             <Icon className="w-6 h-6" />
                           </div>
                           <span className="text-sm font-extrabold px-3 py-1.5 bg-accent-500 text-white rounded-xl shadow-md">
                             {format(item.date, 'MMM do')}
                           </span>
                         </div>
                         <div>
                           <p className="text-primary-100 font-bold mb-1.5 uppercase tracking-wider text-xs">Nearest Upcoming</p>
                           <h4 className="font-extrabold text-2xl md:text-3xl leading-tight mb-2">
                             {item.title}
                           </h4>
                           <p className="text-primary-100 font-medium md:text-lg">
                             {item.subtitle}
                           </p>
                         </div>
                       </div>
                     </motion.div>
                   )
                }

                return (
                  <motion.div 
                    key={`${item.type}-${item._id}-${idx}`}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`relative p-6 rounded-3xl border ${item.border} bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-stone-100 text-stone-600 rounded-xl">
                        {format(item.date, 'MMM do')}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-stone-900 leading-tight mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-sm text-stone-500 font-medium">
                      {item.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
