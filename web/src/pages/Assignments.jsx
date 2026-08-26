import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';

const Assignments = () => {
  const { data: assignments, loading, refetch } = useApi('/assignments');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    courseName: '', taskTitle: '', description: '', dueDate: '', status: 'pending'
  });

  const resetForm = () => {
    setForm({ courseName: '', taskTitle: '', description: '', dueDate: '', status: 'pending' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await put(`/assignments/${editing._id}`, form);
    } else {
      await post('/assignments', form);
    }
    resetForm();
    refetch();
  };

  const handleEdit = (task) => {
    setForm({
      courseName: task.courseName,
      taskTitle: task.taskTitle,
      description: task.description || '',
      dueDate: task.dueDate.split('T')[0],
      status: task.status
    });
    setEditing(task);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      await del(`/assignments/${id}`);
      refetch();
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = {
      'pending': 'in progress',
      'in progress': 'done',
      'done': 'pending'
    };
    await put(`/assignments/${task._id}`, { ...task, status: nextStatus[task.status] });
    refetch();
  };

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h2>Assignments</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>{editing ? 'Edit Assignment' : 'Add Assignment'}</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input required placeholder="Course Name" value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} />
          <input required placeholder="Task Title" value={form.taskTitle} onChange={e => setForm({...form, taskTitle: e.target.value})} />
          <input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <input placeholder="Description (optional)" style={{ flexGrow: 1 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <button type="submit">{editing ? 'Save Changes' : 'Add'}</button>
        {editing && <button type="button" onClick={resetForm} style={{ marginLeft: '1rem' }}>Cancel</button>}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(assignments || []).map(task => (
          <li key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee', opacity: task.status === 'done' ? 0.6 : 1 }}>
            <div>
              <strong>{task.taskTitle}</strong> <span style={{ color: '#666' }}>({task.courseName})</span>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.2rem' }}>
                Due: {task.dueDate.split('T')[0]} | Status: <strong>{task.status}</strong>
                {task.description && <div>{task.description}</div>}
              </div>
            </div>
            <div>
              <button onClick={() => toggleStatus(task)} style={{ marginRight: '0.5rem' }}>Toggle Status</button>
              <button onClick={() => handleEdit(task)} style={{ marginRight: '0.5rem' }}>Edit</button>
              <button onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Assignments;
