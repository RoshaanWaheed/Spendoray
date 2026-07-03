import { useState, useMemo } from 'react';
import { useGetTransactionsQuery } from '../features/transactions/transactionsApi.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Award, Activity, AlertCircle, CalendarRange } from 'lucide-react';

const COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Health: '#ef4444',
  Shopping: '#a855f7',
  Housing: '#f59e0b',
  Other: '#6b7280',
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('Week');
  const { data: transactions, isLoading } = useGetTransactionsQuery();

  const allTxs = transactions || [];

  const expensesInPeriod = useMemo(() => {
    const expenseTxs = allTxs.filter((t) => t.type === 'expense');
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return expenseTxs.filter((tx) => {
      const txDate = new Date(tx.date);
      const diffTime = Math.abs(now - txDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (period === 'Week') {
        return diffDays <= 7;
      } else if (period === 'Month') {
        return diffDays <= 30;
      } else if (period === 'Year') {
        return diffDays <= 365;
      }
      return true;
    });
  }, [allTxs, period]);

  const chartTrendData = useMemo(() => {
    const map = new Map();
    const now = new Date();

    if (period === 'Week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toLocaleDateString('en-US', { weekday: 'short' });
        map.set(dateKey, 0);
      }

      expensesInPeriod.forEach((tx) => {
        const txDate = new Date(tx.date);
        const dateKey = txDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (map.has(dateKey)) {
          map.set(dateKey, map.get(dateKey) + tx.amount);
        }
      });
    } else if (period === 'Month') {
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleDateString('default', { month: 'short' })}`;
        map.set(dateKey, 0);
      }

      expensesInPeriod.forEach((tx) => {
        const txDate = new Date(tx.date);
        const dateKey = `${String(txDate.getDate()).padStart(2, '0')} ${txDate.toLocaleDateString('default', { month: 'short' })}`;
        if (map.has(dateKey)) {
          map.set(dateKey, map.get(dateKey) + tx.amount);
        }
      });
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const dateKey = d.toLocaleDateString('en-US', { month: 'short' });
        map.set(dateKey, 0);
      }

      expensesInPeriod.forEach((tx) => {
        const txDate = new Date(tx.date);
        const dateKey = txDate.toLocaleDateString('en-US', { month: 'short' });
        if (map.has(dateKey)) {
          map.set(dateKey, map.get(dateKey) + tx.amount);
        }
      });
    }

    return Array.from(map.entries()).map(([label, amount]) => ({
      name: label,
      Amount: parseFloat(amount.toFixed(2)),
    }));
  }, [expensesInPeriod, period]);

  const categoryBreakdownData = useMemo(() => {
    const catsMap = {};
    expensesInPeriod.forEach((tx) => {
      catsMap[tx.category] = (catsMap[tx.category] || 0) + tx.amount;
    });

    return Object.entries(catsMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [expensesInPeriod]);

  const insights = useMemo(() => {
    if (expensesInPeriod.length === 0) {
      return {
        biggestSpike: 'No data',
        avgPerDay: '$0.00',
        bestDay: 'No data',
      };
    }

    const dateMap = {};
    expensesInPeriod.forEach((tx) => {
      const dStr = new Date(tx.date).toLocaleDateString();
      dateMap[dStr] = (dateMap[dStr] || 0) + tx.amount;
    });

    const datesGrouped = Object.entries(dateMap);

    let spikeDate = '';
    let spikeAmount = 0;
    datesGrouped.forEach(([date, amt]) => {
      if (amt > spikeAmount) {
        spikeAmount = amt;
        spikeDate = date;
      }
    });

    const formatShortDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const biggestSpike = spikeAmount > 0
      ? `${formatShortDate(spikeDate)} ($${spikeAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
      : 'No data';

    const totalSpent = expensesInPeriod.reduce((sum, tx) => sum + tx.amount, 0);
    const denominator = period === 'Week' ? 7 : period === 'Month' ? 30 : 365;
    const avgPerDayVal = totalSpent / denominator;
    const avgPerDay = `$${avgPerDayVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let minDate = '';
    let minAmount = Infinity;
    datesGrouped.forEach(([date, amt]) => {
      if (amt < minAmount) {
        minAmount = amt;
        minDate = date;
      }
    });

    const daysWithSpentCount = datesGrouped.length;
    let bestDay = '';
    if (daysWithSpentCount < denominator) {
      bestDay = 'No-Spend Day 🎉';
    } else if (minDate) {
      bestDay = `${formatShortDate(minDate)} ($${minAmount.toFixed(0)})`;
    } else {
      bestDay = 'No data';
    }

    return {
      biggestSpike,
      avgPerDay,
      bestDay,
    };
  }, [expensesInPeriod, period]);

  const totalPeriodSpendSum = useMemo(() => {
    return expensesInPeriod.reduce((sum, tx) => sum + tx.amount, 0);
  }, [expensesInPeriod]);

  return (
    <div className="pb-24 pt-4 px-4 md:px-6 md:pb-8 md:pt-6 min-h-screen bg-transparent">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Financial Insights</h2>
          <p className="text-xs text-gray-400 mt-0.5">Visualize your cashflows and spending trends</p>
        </div>

        <div className="flex bg-gray-200/50 p-1 rounded-xl w-full md:w-64" id="period-filter-container">
          {['Week', 'Month', 'Year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer ${
                period === p
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 text-center max-w-sm md:max-w-none shadow-sm md:flex md:items-center md:justify-between md:text-left">
        <div className="mb-2 md:mb-0">
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Total spend this {period.toLowerCase()}</span>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
            ${totalPeriodSpendSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="text-xs text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-xl font-bold shrink-0 self-center hidden md:block">
          Active Filter: Past {period}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" /> Spending Trend
          </h4>
          <div className="w-full h-[200px] md:h-[240px]" id="daily-spend-chart">
            {expensesInPeriod.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No spend records found for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="Amount" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <CalendarRange className="w-3.5 h-3.5 text-indigo-500" /> Category Breakdown
          </h4>
          <div className="w-full h-[200px] md:h-[240px]" id="category-donut-chart">
            {categoryBreakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No categories classified yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Insights</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="insight-tiles-container">
        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Biggest Spike Day</span>
            <span className="text-xs font-bold text-gray-800" id="insight-spike-day">
              {insights.biggestSpike}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Daily Average</span>
            <span className="text-xs font-bold text-gray-800" id="insight-avg-day">
              {insights.avgPerDay}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Day with Least Spend</span>
            <span className="text-xs font-bold text-gray-800" id="insight-best-day">
              {insights.bestDay}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
