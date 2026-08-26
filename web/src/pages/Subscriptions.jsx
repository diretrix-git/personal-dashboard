import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { Plus, Edit2, Trash2, CreditCard, RotateCw, Tag, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Subscriptions = () => {
  const { data: subs, loading, refetch } = useApi('/subscriptions');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    name: '', cost: '', currency: 'USD', billingCycle: 'monthly', renewalDate: '', category: 'Other'
  });

  const resetForm = () => {
    setForm({ name: '', cost: '', currency: 'USD', billingCycle: 'monthly', renewalDate: '', category: 'Other' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, cost: Number(form.cost) };
    try {
      if (editing) {
        await put(`/subscriptions/${editing._id}`, payload);
      } else {
        await post('/subscriptions', payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err.message || 'Error saving subscription');
      setTimeout(() => setFormError(null), 5000);
    }
  };

  const handleEdit = (sub) => {
    setForm({
      name: sub.name,
      cost: sub.cost,
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      renewalDate: sub.renewalDate.split('T')[0],
      category: sub.category
    });
    setEditing(sub);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subscription?')) {
      try {
        await del(`/subscriptions/${id}`);
        refetch();
      } catch (err) {
        setFormError(err.message || 'Error deleting subscription');
        setTimeout(() => setFormError(null), 5000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading subscriptions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {formError && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {formError}
            <button onClick={() => setFormError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Subscriptions</h2>
          <p className="text-stone-500 mt-1">Manage your recurring payments.</p>
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
              <Plus className="w-5 h-5" /> Add Subscription
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
            className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 mb-8"
          >
            <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
              {editing ? 'Edit Subscription' : 'Add New Subscription'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Name</label>
                <input required className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Netflix, Spotify..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Cost</label>
                <div className="flex gap-2">
                  <input required className="w-24 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all uppercase font-semibold" placeholder="USD" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} />
                  <input required type="number" step="0.01" className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="0.00" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Billing Cycle</label>
                <select className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white" value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-stone-700">Renewal Date</label>
                <input required type="date" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={form.renewalDate} onChange={e => setForm({...form, renewalDate: e.target.value})} />
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <label className="text-sm font-bold text-stone-700">Category</label>
                <input className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Entertainment, Utility..." value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <motion.button whileTap={{ scale: 0.95 }} type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-bold shadow-md shadow-primary-600/20">
                {editing ? 'Save Changes' : 'Add Subscription'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={resetForm} className="px-6 py-2.5 bg-white text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors font-bold">
                Cancel
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {subs && subs.length === 0 && !showForm ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200"
        >
          <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-900">No subscriptions yet</h3>
          <p className="text-stone-500 mt-1 mb-5 font-medium">Keep track of your recurring expenses by adding one.</p>
          <button onClick={() => setShowForm(true)} className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
            + Add your first subscription
          </button>
        </motion.div>
      ) : (
        <motion.ul 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          <AnimatePresence>
            {(subs || []).map(sub => (
              <motion.li 
                layout
                key={sub._id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(sub)} className="p-2 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(sub._id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-stone-900 mb-1">{sub.name}</h3>
                <div className="text-3xl font-black text-stone-800 mb-5 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-stone-400 uppercase">{sub.currency}</span>
                  {sub.cost.toFixed(2)}
                  <span className="text-sm font-semibold text-stone-400">/{sub.billingCycle === 'monthly' ? 'mo' : sub.billingCycle === 'yearly' ? 'yr' : 'wk'}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-stone-100 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-stone-600 font-medium">
                    <RotateCw className="w-4 h-4 text-stone-400" />
                    <span>Renews <strong className="text-stone-800">{sub.renewalDate.split('T')[0]}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-stone-600 font-medium">
                    <Tag className="w-4 h-4 text-stone-400" />
                    <span>{sub.category}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
};

export default Subscriptions;
