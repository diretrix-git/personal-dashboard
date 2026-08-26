import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';

const Subscriptions = () => {
  const { data: subs, loading, refetch } = useApi('/subscriptions');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: '', cost: '', currency: 'USD', billingCycle: 'monthly', renewalDate: '', category: 'Other'
  });

  const resetForm = () => {
    setForm({ name: '', cost: '', currency: 'USD', billingCycle: 'monthly', renewalDate: '', category: 'Other' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, cost: Number(form.cost) };
    if (editing) {
      await put(`/subscriptions/${editing._id}`, payload);
    } else {
      await post('/subscriptions', payload);
    }
    resetForm();
    refetch();
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
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subscription?')) {
      await del(`/subscriptions/${id}`);
      refetch();
    }
  };

  if (loading) return <div>Loading subscriptions...</div>;

  return (
    <div>
      <h2>Subscriptions</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>{editing ? 'Edit Subscription' : 'Add Subscription'}</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="number" step="0.01" placeholder="Cost" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
          <input required placeholder="Currency (USD)" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} />
          <select value={form.billingCycle} onChange={e => setForm({...form, billingCycle: e.target.value})}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input required type="date" value={form.renewalDate} onChange={e => setForm({...form, renewalDate: e.target.value})} />
          <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
        </div>
        <button type="submit">{editing ? 'Save Changes' : 'Add'}</button>
        {editing && <button type="button" onClick={resetForm} style={{ marginLeft: '1rem' }}>Cancel</button>}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(subs || []).map(sub => (
          <li key={sub._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
            <div>
              <strong>{sub.name}</strong> - {sub.currency} {sub.cost} / {sub.billingCycle}
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Renews: {sub.renewalDate.split('T')[0]} | {sub.category}</div>
            </div>
            <div>
              <button onClick={() => handleEdit(sub)} style={{ marginRight: '0.5rem' }}>Edit</button>
              <button onClick={() => handleDelete(sub._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Subscriptions;
