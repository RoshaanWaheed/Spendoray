import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddTransactionMutation } from '../features/transactions/transactionsApi.js';
import { Wallet, Calendar, FileText, Check, ShieldAlert } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Health', 'Shopping', 'Housing', 'Other'];
const INCOME_CATEGORIES = ['Income', 'Other'];

export default function AddExpensePage() {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [addTransaction, { isLoading }] = useAddTransactionMutation();

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Income');
    } else {
      setCategory('Food');
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      await addTransaction({
        type,
        amount: parsedAmount,
        category,
        note: note.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString()
      }).unwrap();

      setAmount('');
      setNote('');
      navigate('/');
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to record transaction');
    }
  };

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="pb-24 pt-4 px-4 md:px-6 md:pb-8 md:pt-6 min-h-screen bg-transparent">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Add Transaction</h2>
        <p className="text-xs text-gray-400 mt-0.5">Log an income or an expense outflow</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2 border border-red-100 animate-fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="add-expense-form">
        <div className="flex bg-gray-200/50 p-1 rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Income
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-2">Transaction Amount</span>
              <div className="flex items-center justify-center">
                <span className={`text-4xl font-extrabold mr-1 ${type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  id="amount-input"
                  className="text-center text-4xl font-black w-48 focus:outline-none placeholder-gray-200 border-b border-dashed border-gray-200 py-1"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-3">Choose Category</span>
              <div className="flex flex-wrap gap-2" id="category-pills-list">
                {activeCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold border transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-205 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider mb-0.5">Transaction Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-sm font-semibold text-gray-700 w-full focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider mb-0.5">Add Note</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Weekly grocery at Costco, taxi..."
                  className="text-sm text-gray-700 w-full focus:outline-none placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              id="add-tx-submit-btn"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm transition duration-150 flex justify-center items-center shadow-md shadow-indigo-600/10 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              } disabled:bg-gray-300`}
            >
              {isLoading ? 'Recording...' : 'Save Transaction'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
