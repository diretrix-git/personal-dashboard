import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { Plus, Edit2, Trash2, BookOpen, Clock, CheckCircle2, Circle } from 'lucide-react';

const Assignments = () => {
  const { data: assignments, loading, refetch } = useApi('/assignments');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    courseName: '', taskTitle: '', dueDate: '', status: 'pending'
  });

  const resetForm = () => {
    setForm({ courseName: '', taskTitle: '', dueDate: '', status: 'pending' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await put(`/assignments/${editing._id}`, form);
      } else {
        await post('/assignments', form);
      }
      resetForm();
      refetch();
    } catch (err) {
      alert(err.message || 'Error saving assignment');
    }
  };

  const handleEdit = (task) => {
    setForm({
      courseName: task.courseName,
      taskTitle: task.taskTitle,
      dueDate: task.dueDate.split('T')[0],
      status: task.status
    });
    setEditing(task);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await del(`/assignments/${id}`);
        refetch();
      } catch (err) {
        alert(err.message || 'Error deleting assignment');
      }
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = { 'pending': 'in progress', 'in progress': 'done', 'done': 'pending' };
    try {
      // Send only required fields to avoid BUG-6 side effects
      await put(`/assignments/${task._id}`, { 
        courseName: task.courseName,
        taskTitle: task.taskTitle,
        dueDate: task.dueDate,
        status: nextStatus[task.status] 
      });
      refetch();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading assignments...
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h2>
          <p className="text-slate-500 mt-1">Track your coursework and deadlines.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Assignment
          </button>
        )}
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            {editing ? 'Edit Assignment' : 'Add New Assignment'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Course Name</label>
              <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. CS 101" value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Task Title</label>
              <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. Final Essay" value={form.taskTitle} onChange={e => setForm({...form, taskTitle: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Due Date</label>
              <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm">
              {editing ? 'Save Changes' : 'Add Assignment'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      {assignments && assignments.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No assignments</h3>
          <p className="text-slate-500 mt-1 mb-4">You're all caught up on your coursework!</p>
          <button onClick={() => setShowForm(true)} className="text-primary-600 font-medium hover:text-primary-700">
            + Add a new assignment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {(assignments || []).map(task => (
            <div 
              key={task._id} 
              className={`bg-white rounded-xl p-4 border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center gap-4 group ${
                task.status === 'done' ? 'border-slate-200 opacity-70 bg-slate-50 hover:opacity-100' : 'border-slate-200 hover:shadow-md'
              }`}
            >
              {/* Status Toggle Button */}
              <button 
                onClick={() => toggleStatus(task)}
                className={`shrink-0 transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-primary-500'}`}
                title="Click to toggle status"
              >
                {task.status === 'done' ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className={`text-lg font-bold truncate ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {task.taskTitle}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(task.status)} capitalize`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <BookOpen className="w-4 h-4 text-slate-400" /> {task.courseName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Due: {task.dueDate.split('T')[0]}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0 border-slate-100">
                <button onClick={() => handleEdit(task)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(task._id)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;
