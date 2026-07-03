import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, PiggyBank, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (targetPath) => {
    return path === targetPath;
  };

  const navItems = [
    { label: 'Home', icon: Home, fileRoute: '/' },
    { label: 'Stats', icon: BarChart2, fileRoute: '/analytics' },
    { label: 'Add', icon: PlusCircle, fileRoute: '/add', highlight: true },
    { label: 'Budget', icon: PiggyBank, fileRoute: '/budget' },
    { label: 'Profile', icon: User, fileRoute: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-50 md:hidden">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const active = isActive(item.fileRoute);

        if (item.highlight) {
          return (
            <Link
              key={item.label}
              to={item.fileRoute}
              id={`nav-item-${item.label.toLowerCase()}`}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition duration-150">
                <IconComponent className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-medium text-indigo-600 mt-1">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.fileRoute}
            id={`nav-item-${item.label.toLowerCase()}`}
            className={`flex flex-col items-center justify-center py-1 transition duration-150 ${
              active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <IconComponent className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
