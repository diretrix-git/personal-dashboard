import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { Plus, Edit2, Trash2, BookOpen, Clock, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      await put(`/assignments/${task._id}`, { 
        status: nextStatus[task.status] 
      });
      refetch();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading assignments...
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Assignments</h2>
          <p className="text-stone-500 mt-1 font-medium">Track your coursework and deadlines.</p>
        </div>
        <AnimatePresence>
          {!showForm && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-md shadow-primary-600/20"
            >
              <Plus className="w-5 h-5" /> Add Assignment
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
            onSubmit={handleSubmit} 
            className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 mb-8"
          >
            <h3 className="text-xl font-bold text-stone-900 mb-6 pb-3 border-b border-stone-100">
              {editing ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Course Name</label>
                <input required className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. CS 101" value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Task Title</label>
                <input required className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="e.g. Final Essay" value={form.taskTitle} onChange={e => setForm({...form, taskTitle: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Due Date</label>
                <input required type="date" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Status</label>
                <select className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white font-medium" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button whileTap={{ scale: 0.95 }} type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-md shadow-primary-600/20">
                {editing ? 'Save Changes' : 'Add Assignment'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={resetForm} className="px-6 py-2.5 bg-white text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors font-bold">
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {assignments && assignments.length === 0 && !showForm ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200"
        >
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-900">No assignments</h3>
          <p className="text-stone-500 mt-1 mb-5 font-medium">You're all caught up on your coursework!</p>
          <button onClick={() => setShowForm(true)} className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
            + Add a new assignment
          </button>
        </motion.div>
      ) : (
        <motion.ul 
          className="space-y-4"
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
          <AnimatePresence mode="popLayout">
            {(assignments || []).map(task => (
              <motion.li 
                layout
                key={task._id} 
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                whileHover={{ scale: 1.01 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center gap-5 group ${
                  task.status === 'done' ? 'border-stone-200 opacity-60 hover:opacity-100 bg-stone-50' : 'border-stone-100 hover:shadow-md'
                }`}
              >
                {/* Status Toggle Button */}
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => toggleStatus(task)}
                  className={`shrink-0 transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-stone-300 hover:text-accent-500'}`}
                  title="Click to toggle status"
                >
                  {task.status === 'done' ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                </motion.button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 className={`text-lg font-bold truncate ${task.status === 'done' ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                      {task.taskTitle}
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-bold ${getStatusColor(task.status)} capitalize`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1.5 font-bold text-stone-700">
                      <BookOpen className="w-4 h-4 text-stone-400" /> {task.courseName}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-stone-400" /> Due: {task.dueDate.split('T')[0]}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0 border-stone-100">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(task)} className="px-3.5 py-2 text-sm font-bold text-stone-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors flex items-center gap-1.5">
                    <Edit2 className="w-4 h-4" /> Edit
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(task._id)} className="px-3.5 py-2 text-sm font-bold text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" /> Delete
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default Assignments;
