import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BottomNav from './components/BottomNav.jsx';
import Sidebar from './components/Sidebar.jsx';

function AppLayout() {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register'];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#f0eeff',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 10% 10%,  #c4b5fd 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 90% 5%,   #a5b4fc 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 80% 90%,  #f9a8d4 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 5%  90%,  #fde68a 0%, transparent 50%),
          radial-gradient(ellipse 70% 60% at 50% 50%,  #e0e7ff 0%, transparent 65%)
        `,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div
        className={`w-full mx-auto min-h-screen md:min-h-[calc(100vh-3rem)] flex flex-col md:flex-row md:py-6 ${
          showNav
            ? 'max-w-md md:max-w-7xl md:bg-transparent shadow-sm md:shadow-none border-x border-gray-100 md:border-none'
            : 'max-w-md'
        }`}
      >
        {showNav && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />

            <Route path="/"          element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/add"       element={<ProtectedRoute><AddExpensePage /></ProtectedRoute>} />
            <Route path="/budget"    element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppLayout />
      </Router>
    </Provider>
  );
}