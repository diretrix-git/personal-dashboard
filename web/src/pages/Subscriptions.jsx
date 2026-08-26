import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { Plus, Edit2, Trash2, CreditCard, RotateCw, Tag } from 'lucide-react';

const Subscriptions = () => {
  const { data: subs, loading, refetch } = useApi('/subscriptions');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
      alert(err.message || 'Error saving subscription');
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
        alert(err.message || 'Error deleting subscription');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading subscriptions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscriptions</h2>
          <p className="text-slate-500 mt-1">Manage your recurring payments.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Subscription
          </button>
        )}
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            {editing ? 'Edit Subscription' : 'Add New Subscription'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Netflix, Spotify..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cost</label>
              <div className="flex gap-2">
                <input required className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all uppercase" placeholder="USD" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} />
                <input required type="number" step="0.01" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="0.00" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Billing Cycle</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white" value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Renewal Date</label>
              <input required type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={form.renewalDate} onChange={e => setForm({...form, renewalDate: e.target.value})} />
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Entertainment, Utility..." value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm">
              {editing ? 'Save Changes' : 'Add Subscription'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      {subs && subs.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No subscriptions yet</h3>
          <p className="text-slate-500 mt-1 mb-4">Keep track of your recurring expenses by adding one.</p>
          <button onClick={() => setShowForm(true)} className="text-primary-600 font-medium hover:text-primary-700">
            + Add your first subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(subs || []).map(sub => (
            <div key={sub._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(sub)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sub._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{sub.name}</h3>
              <div className="text-2xl font-black text-slate-800 mb-4 flex items-baseline gap-1">
                <span className="text-sm font-semibold text-slate-500 uppercase">{sub.currency}</span>
                {sub.cost.toFixed(2)}
                <span className="text-sm font-medium text-slate-500 font-normal">/{sub.billingCycle === 'monthly' ? 'mo' : sub.billingCycle === 'yearly' ? 'yr' : 'wk'}</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RotateCw className="w-4 h-4 text-slate-400" />
                  <span>Renews <strong className="text-slate-700">{sub.renewalDate.split('T')[0]}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>{sub.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
