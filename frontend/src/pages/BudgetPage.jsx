import { useState, useMemo } from 'react';
import { useGetBudgetsQuery, useAddBudgetMutation, useDeleteBudgetMutation } from '../features/budgets/budgetsApi.js';
import { useGetTransactionsQuery } from '../features/transactions/transactionsApi.js';
import {
  PiggyBank,
  Edit2,
  AlertTriangle,
  Utensils,
  Car,
  HeartPulse,
  ShoppingBag,
  Home as HomeIcon,
  HelpCircle,
  Plus,
  X,
  Target,
  ChevronRight
} from 'lucide-react';

const BUDGET_CATEGORIES = ['Food', 'Transport', 'Health', 'Shopping', 'Housing', 'Other'];

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Health: HeartPulse,
  Shopping: ShoppingBag,
  Housing: HomeIcon,
  Other: HelpCircle,
};

export default function BudgetPage() {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgetsQuery(currentMonthStr);
  const { data: transactions, isLoading: isTxsLoading } = useGetTransactionsQuery();
  const [addBudget, { isLoading: isSavingBudget }] = useAddBudgetMutation();
  const [deleteBudget] = useDeleteBudgetMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [limitValue, setLimitValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeMonthSpentMap = useMemo(() => {
    const map = {};
    BUDGET_CATEGORIES.forEach(cat => { map[cat] = 0; });
    
    if (!transactions) return map;

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      
      const txDate = new Date(t.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        if (BUDGET_CATEGORIES.includes(t.category)) {
          map[t.category] = (map[t.category] || 0) + t.amount;
        } else {
          map['Other'] = (map['Other'] || 0) + t.amount;
        }
      }
    });

    return map;
  }, [transactions, today]);

  const budgetLimitsMap = useMemo(() => {
    const map = {};
    BUDGET_CATEGORIES.forEach(cat => { map[cat] = { limit: 0, id: null }; });

    if (!budgets) return map;

    budgets.forEach(b => {
      if (BUDGET_CATEGORIES.includes(b.category)) {
        map[b.category] = { limit: b.limit, id: b._id };
      }
    });

    return map;
  }, [budgets]);

  const overallLimit = useMemo(() => {
    return Object.values(budgetLimitsMap).reduce((sum, b) => sum + b.limit, 0);
  }, [budgetLimitsMap]);

  const overallSpent = useMemo(() => {
    return Object.keys(activeMonthSpentMap).reduce((sum, cat) => {
      if (budgetLimitsMap[cat] && budgetLimitsMap[cat].limit > 0) {
        return sum + activeMonthSpentMap[cat];
      }
      return sum;
    }, 0);
  }, [activeMonthSpentMap, budgetLimitsMap]);

  const overallPercent = overallLimit > 0 ? (overallSpent / overallLimit) * 100 : 0;

  const handleOpenEdit = (category, currentLimit) => {
    setSelectedCategory(category);
    setLimitValue(currentLimit > 0 ? currentLimit.toString() : '');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedLimit = parseFloat(limitValue);
    if (!limitValue || isNaN(parsedLimit) || parsedLimit < 0) {
      setErrorMsg('Please enter a valid limit amount (0 or more)');
      return;
    }

    try {
      await addBudget({
        category: selectedCategory,
        limit: parsedLimit,
        month: currentMonthStr
      }).unwrap();

      setIsOpen(false);
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to update budget limit');
    }
  };

  const handleResetBudget = async (category, budgetId) => {
    if (!budgetId) return;
    if (confirm(`Do you want to reset the budget limit for ${category}?`)) {
      try {
        await deleteBudget(budgetId).unwrap();
      } catch (err) {
        alert('Failed to reset budget: ' + (err.data?.message || err.message));
      }
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-6 md:pb-8 md:pt-6 min-h-screen bg-transparent">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Monthly Budget</h2>
          <p className="text-xs text-gray-400 mt-0.5">Control and split your spend limits</p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
          {today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm" id="overall-budget-card">
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Overall Monthly Target</span>
              <span className="text-sm font-bold text-gray-800">
                ${overallSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} of ${overallLimit.toLocaleString(undefined, { maximumFractionDigits: 0 })} spent
              </span>
            </div>
          </div>
          {overallPercent > 100 && (
            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Budget Overspent
            </div>
          )}
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              overallPercent >= 100
                ? 'bg-rose-500'
                : overallPercent >= 75
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-2.5">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">{overallPercent.toFixed(0)}% Utilized</span>
          {overallLimit === 0 && (
            <span className="text-[10px] text-indigo-600 font-bold">Configure category limits below</span>
          )}
        </div>
      </div>

      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories Budget Limits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="category-budgets-container">
        {BUDGET_CATEGORIES.map((cat) => {
          const spent = activeMonthSpentMap[cat] || 0;
          const { limit, id: budgetId } = budgetLimitsMap[cat] || { limit: 0, id: null };
          const percent = limit > 0 ? (spent / limit) * 100 : 0;
          const IconComp = categoryIcons[cat] || HelpCircle;

          let barColor = 'bg-emerald-500';
          let textColor = 'text-emerald-600';
          if (percent > 90) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-600';
          } else if (percent >= 70) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-600';
          }

          return (
            <div
              key={cat}
              id={`budget-item-${cat.toLowerCase()}`}
              className="bg-white border border-gray-100 p-5 rounded-2xl group hover:border-gray-200 transition duration-150 shadow-sm flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">{cat}</span>
                      <span className="text-[10px] text-gray-400 font-semibold block">
                        {limit > 0 ? (
                          <>
                            <span className="font-extrabold text-gray-700">${spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> of ${limit.toLocaleString()} spent
                          </>
                        ) : (
                          'No budget limit set'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {limit > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-300`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[9px] font-semibold text-gray-400">
                      <span>{percent.toFixed(0)}% used</span>
                      {percent > 100 && <span className="text-red-500">Exceeded by ${(spent - limit).toFixed(0)}</span>}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <button
                    onClick={() => handleOpenEdit(cat, limit)}
                    className="py-1 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-100/50 hover:border-indigo-100 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer bg-white"
                  >
                    <Edit2 className="w-3 h-3" /> Set Limit
                  </button>
                  {limit > 0 && (
                    <button
                      onClick={() => handleResetBudget(cat, budgetId)}
                      className="text-xs text-gray-300 hover:text-red-500 font-bold cursor-pointer transition duration-150"
                      title="Reset budget limit"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-end justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-100 p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-gray-900 text-sm">Budget Limit for {selectedCategory}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Budget Maximum ($ Limit)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={limitValue}
                    onChange={(e) => setLimitValue(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-gray-800"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBudget}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 cursor-pointer"
                >
                  {isSavingBudget ? 'Saving...' : 'Set Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
