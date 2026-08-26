import { useApi } from '../hooks/useApi';
import { isBefore, addDays, parseISO, format } from 'date-fns';

const Home = () => {
  const { data: subs, loading: loadingSubs } = useApi('/subscriptions');
  const { data: assignments, loading: loadingAssignments } = useApi('/assignments');

  if (loadingSubs || loadingAssignments) return <div>Loading dashboard...</div>;

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
      subtitle: `${sub.currency} ${sub.cost} (${sub.billingCycle})`
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
      subtitle: `${task.courseName} - ${task.status}`
    }));

  // Combine and sort
  const upcomingItems = [...upcomingSubs, ...upcomingAssignments].sort((a, b) => a.date - b.date);

  return (
    <div>
      <h2>Upcoming in the next 7 days</h2>
      {upcomingItems.length === 0 ? (
        <p>No upcoming renewals or due dates this week! 🎉</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {upcomingItems.map(item => (
            <li key={item._id} style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '8px',
              borderLeft: `4px solid ${item.type === 'subscription' ? '#0070f3' : '#e00'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{item.title}</strong>
                <span style={{ color: '#666' }}>{format(item.date, 'MMM do, yyyy')}</span>
              </div>
              <div style={{ color: '#555', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {item.subtitle}
                <span style={{ 
                  display: 'inline-block', 
                  marginLeft: '1rem', 
                  padding: '0.2rem 0.5rem', 
                  background: '#eee', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem' 
                }}>
                  {item.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
