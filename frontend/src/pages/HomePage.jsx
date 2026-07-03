import { useGetTransactionsQuery, useDeleteTransactionMutation } from '../features/transactions/transactionsApi.js';
import { useGetBudgetsQuery } from '../features/budgets/budgetsApi.js';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Utensils,
  Car,
  HeartPulse,
  ShoppingBag,
  Home as HomeIcon,
  HelpCircle,
  TrendingUp as IncomeIcon,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Health: HeartPulse,
  Shopping: ShoppingBag,
  Housing: HomeIcon,
  Income: IncomeIcon,
  Other: HelpCircle,
};

const categoryColors = {
  Food: 'bg-orange-100 text-orange-600',
  Transport: 'bg-blue-100 text-blue-600',
  Health: 'bg-red-100 text-red-600',
  Shopping: 'bg-purple-100 text-purple-600',
  Housing: 'bg-amber-100 text-amber-600',
  Income: 'bg-green-100 text-green-600',
  Other: 'bg-gray-100 text-gray-600',
};

export default function HomePage() {
  const { user } = useSelector((state) => state.auth);
  
  const { data: transactions, isLoading, error } = useGetTransactionsQuery();
  
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const { data: budgets } = useGetBudgetsQuery(currentMonthStr);
  
  const [deleteTransaction] = useDeleteTransactionMutation();

  const formatTxDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const allTxs = transactions || [];
  
  const totalIncome = allTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const thisMonthTxs = allTxs.filter(t => {
    const txDate = new Date(t.date);
    return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
  });

  const thisMonthSpent = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudgetLimit = budgets ? budgets.reduce((sum, b) => sum + (b.limit || 0), 0) : 0;
  const budgetLeft = totalBudgetLimit - thisMonthSpent;

  const recentTransactions = allTxs.slice(0, 5);

  const handleDelete = async (txId) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(txId).unwrap();
      } catch (err) {
        alert('Failed to delete transaction: ' + (err.data?.message || err.message));
      }
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-6 md:pb-8 md:pt-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs text-gray-400 font-medium tracking-wide">Welcome back</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800" id="welcome-username">
            {user?.name || 'Spendor'}
          </h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="w-full rounded-2xl bg-indigo-600 p-6 text-white relative overflow-hidden md:col-span-2 shadow-sm" id="hero-balance-card">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl"></div>
              <div className="absolute left-0 bottom-0 -translate-x-4 translate-y-4 w-28 h-28 bg-indigo-700/20 rounded-full blur-xl"></div>
              
              <span className="text-xs text-indigo-100/80 font-medium">Total Balance</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-1 tracking-tight" id="balance-amount">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-indigo-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 block uppercase font-medium">Income</span>
                    <span className="text-sm font-bold block" id="total-income">
                      +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 block uppercase font-medium">Expenses</span>
                    <span className="text-sm font-bold block" id="total-expenses">
                      -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:col-span-1">
              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider mb-1">Spent This Month</span>
                  <span className="text-xl font-bold text-gray-800" id="this-month-spent">
                    ${thisMonthSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-4 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> {today.toLocaleString('default', { month: 'long' })}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase tracking-wider mb-1">Budget Left</span>
                  <span className={`text-xl font-bold ${budgetLeft < 0 ? 'text-red-600' : 'text-emerald-600'}`} id="budget-left-this-month">
                    {budgetLeft < 0 ? '-' : ''}${Math.abs(budgetLeft).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-4 block font-medium">
                  limit: ${totalBudgetLimit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Transactions</h3>
            <Link to="/analytics" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 active:scale-95 transition-all">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div id="transactions-list-container" className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading transactions...</div>
            ) : error ? (
              <div className="py-8 text-center text-xs text-red-500 bg-red-50 rounded-2xl border border-red-100 p-4">
                <AlertCircle className="w-5 h-5 mx-auto mb-1.5" />
                Failed to retrieve transactions or mock databases
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md border border-dashed border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <span className="text-xs text-gray-400 block mb-3">No expenses recorded yet</span>
                <Link to="/add" className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition duration-150">
                  Create your first expense
                </Link>
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const IconComponent = categoryIcons[tx.category] || HelpCircle;
                const bgClass = categoryColors[tx.category] || 'bg-gray-100 text-gray-600';
                const isExpense = tx.type === 'expense';

                return (
                  <div
                    key={tx._id}
                    id={`tx-item-${tx._id}`}
                    className="bg-white/80 backdrop-blur-md border border-white/60 p-3.5 rounded-2xl flex items-center justify-between group hover:border-gray-200 shadow-sm transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 block truncate max-w-[140px]">
                          {tx.note || tx.category}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                          {tx.category} • {formatTxDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isExpense ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleDelete(tx._id)}
                        aria-label="Delete transaction"
                        className="p-1 px-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition duration-150 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}