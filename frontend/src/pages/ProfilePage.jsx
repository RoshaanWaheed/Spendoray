import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { logout, setCredentials } from '../features/auth/authSlice.js';
import { Mail, LogOut, Heart, Key, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of Spendoray?')) {
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');
    setNameLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Name update failed');
      dispatch(setCredentials({ user: resData.data.user, token: resData.data.token }));
      localStorage.setItem('token', resData.data.token);
      setNameSuccess('Name updated successfully!');
    } catch (err) {
      setNameError(err.message || 'Name update failed');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Password update failed');
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-6 md:pb-8 md:pt-6 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your personal account settings</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-8 shadow-sm relative overflow-hidden" id="profile-card">
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[10px] font-bold uppercase py-0.5 px-2.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
              Active User
            </span>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-black mb-4 tracking-tighter shadow-md shadow-indigo-600/10">
              {getInitials(user?.name)}
            </div>
            <h3 className="text-xl font-black text-gray-800" id="profile-display-name">{user?.name || 'Spendor User'}</h3>
            <p className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1.5 mt-2">
              <Mail className="w-4 h-4 text-gray-400" /> {user?.email || 'user@spendoray.com'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Update Name</h3>
              </div>
              <form onSubmit={handleNameUpdate} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150"
                  required
                />
                {nameError && <p className="text-xs text-red-600">{nameError}</p>}
                {nameSuccess && <p className="text-xs text-green-600">{nameSuccess}</p>}
                <button type="submit" disabled={nameLoading} className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-150">
                  {nameLoading ? 'Updating...' : 'Update Name'}
                </button>
              </form>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Update Password</h3>
              </div>
              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150" required />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150" required minLength={6} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150" required minLength={6} />
                {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}
                <button type="submit" disabled={passwordLoading} className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-150">
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                id="logout-action-btn"
                className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 text-xs transition duration-150 flex justify-center items-center gap-2 cursor-pointer bg-white/60"
              >
                <LogOut className="w-4 h-4" /> Log Out from Spendoray
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}