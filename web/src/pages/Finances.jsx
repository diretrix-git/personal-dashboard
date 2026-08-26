import { useState, useMemo } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { isSameMonth, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300'];

const Finances = () => {
  const { data: finances, loading, refetch } = useApi('/finances');
  const { post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    amount: '', type: 'expense', category: 'General', date: '', description: ''
  });

  const resetForm = () => {
    setForm({ amount: '', type: 'expense', category: 'General', date: '', description: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editing) {
      await put(`/finances/${editing._id}`, payload);
    } else {
      await post('/finances', payload);
    }
    resetForm();
    refetch();
  };

  const handleEdit = (entry) => {
    setForm({
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      date: entry.date.split('T')[0],
      description: entry.description || ''
    });
    setEditing(entry);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      await del(`/finances/${id}`);
      refetch();
    }
  };

  // Chart Logic: Expenses by Category for the current month
  const chartData = useMemo(() => {
    if (!finances) return [];
    
    const now = new Date();
    const expensesThisMonth = finances.filter(entry => 
      entry.type === 'expense' && isSameMonth(parseISO(entry.date), now)
    );

    const categoryTotals = expensesThisMonth.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {});

    return Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat]
    })).sort((a, b) => b.value - a.value);
  }, [finances]);

  if (loading) return <div>Loading finances...</div>;

  return (
    <div>
      <h2>Finances</h2>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 400px' }}>
          <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', height: '100%' }}>
            <h3>{editing ? 'Edit Entry' : 'Add Entry'}</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <input required type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input required placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <input placeholder="Description (optional)" style={{ flexGrow: 1 }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <button type="submit">{editing ? 'Save Changes' : 'Add'}</button>
            {editing && <button type="button" onClick={resetForm} style={{ marginLeft: '1rem' }}>Cancel</button>}
          </form>
        </div>

        <div style={{ flex: '1 1 300px', height: '300px', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>This Month's Expenses</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              No expenses recorded this month yet.
            </div>
          )}
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(finances || []).map(entry => (
          <li key={entry._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
            <div>
              <strong>{entry.category}</strong> <span style={{ color: entry.type === 'income' ? 'green' : 'red' }}>
                {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
              </span>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.2rem' }}>
                {entry.date.split('T')[0]} 
                {entry.description && ` | ${entry.description}`}
              </div>
            </div>
            <div>
              <button onClick={() => handleEdit(entry)} style={{ marginRight: '0.5rem' }}>Edit</button>
              <button onClick={() => handleDelete(entry._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Finances;
