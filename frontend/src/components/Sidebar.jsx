import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, PiggyBank, User, Wallet } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (targetPath) => {
    return path === targetPath;
  };

  const navItems = [
    { label: 'Home', icon: Home, fileRoute: '/' },
    { label: 'Financial Insights', icon: BarChart2, fileRoute: '/analytics' },
    { label: 'Add Transaction', icon: PlusCircle, fileRoute: '/add' },
    { label: 'Monthly Budget', icon: PiggyBank, fileRoute: '/budget' },
    { label: 'My Profile', icon: User, fileRoute: '/profile' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen px-4 py-6 shrink-0 sticky top-0 self-start">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Spendoray</h1>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-1">Smart Budgeting</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.fileRoute);

          return (
            <Link
              key={item.label}
              to={item.fileRoute}
              id={`sidebar-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
      </div>
    </aside>
  );
}
