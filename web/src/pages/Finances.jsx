import { useState } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Edit2, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Finances = () => {
  const { data: finances, loading, refetch } = useApi('/finances');
  const { mutating, post, put, del } = useMutation();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    amount: '', type: 'expense', category: '', date: '', description: ''
  });

  const resetForm = () => {
    setForm({ amount: '', type: 'expense', category: '', date: '', description: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editing) {
        await put(`/finances/${editing._id}`, payload);
      } else {
        await post('/finances', payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      setFormError(err.message || 'Error saving record');
      setTimeout(() => setFormError(null), 5000);
    }
  };

  const handleEdit = (record) => {
    setForm({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date.split('T')[0],
      description: record.description || ''
    });
    setEditing(record);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await del(`/finances/${id}`);
        refetch();
      } catch (err) {
        setFormError(err.message || 'Error deleting record');
        setTimeout(() => setFormError(null), 5000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
        Loading finances...
      </div>
    );
  }

  // Calculate totals and chart data
  let totalIncome = 0;
  let totalExpense = 0;
  const expensesByCategory = {};

  (finances || []).forEach(item => {
    if (item.type === 'income') totalIncome += item.amount;
    else {
      totalExpense += item.amount;
      expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    }
  });

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  })).sort((a, b) => b.value - a.value);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {formError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {formError}
          <button onClick={() => setFormError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Finances</h2>
          <p className="text-stone-500 mt-1">Track your income and expenses.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        )}
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Income</p>
            <p className="text-2xl font-bold text-stone-900">${totalIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500">Total Expenses</p>
            <p className="text-2xl font-bold text-stone-900">${totalExpense.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-stone-900 rounded-xl p-5 border border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-white/10 text-white rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-400">Net Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-stone-100">
            {editing ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Type</label>
              <select className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Amount ($)</label>
              <input required type="number" step="0.01" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <input required className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Food, Rent, Salary..." value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700">Date</label>
              <input required type="date" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-4">
              <label className="text-sm font-medium text-stone-700">Description (Optional)</label>
              <input className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Notes..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={mutating} className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? 'Save Changes' : 'Add Transaction'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2 bg-white text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors font-medium">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-stone-900">Recent Transactions</h3>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            {finances && finances.length === 0 ? (
              <div className="p-8 text-center text-stone-500">No transactions found.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {(finances || []).map(item => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {item.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{item.category}</p>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                          <span>{item.date.split('T')[0]}</span>
                          {item.description && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                              <span className="truncate max-w-[150px] sm:max-w-xs">{item.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold whitespace-nowrap ${item.type === 'income' ? 'text-emerald-600' : 'text-stone-900'}`}>
                        {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Chart */}
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-4">Expenses by Category</h3>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex flex-col items-center justify-center">
            {chartData.length === 0 ? (
              <p className="text-stone-500 text-center py-12">Not enough data to display chart.</p>
            ) : (
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;
