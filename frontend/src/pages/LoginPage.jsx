import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice.js';
import { Wallet, ShieldAlert, ArrowLeft, Mail, KeyRound, LockKeyhole } from 'lucide-react';

const Card = ({ children }) => (
  <div className="min-h-screen flex flex-col justify-center px-4 py-8">
    <div className="w-full max-w-sm mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-indigo-500/10 p-6">
      {children}
    </div>
  </div>
);

const Logo = () => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white mb-3">
      <Wallet className="w-6 h-6" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Spendoray</h1>
    <p className="text-sm text-gray-400 mt-1">Smart Expense Tracker</p>
  </div>
);

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition duration-150">
    <ArrowLeft className="w-3.5 h-3.5" /> Back to login
  </button>
);

const ErrorBox = ({ msg }) => msg ? (
  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2 border border-red-100">
    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{msg}</span>
  </div>
) : null;

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150";
const btnClass = "w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-150 flex justify-center items-center cursor-pointer";
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

export default function LoginPage() {
  const [step, setStep] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password'); return; }
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Login failed');
      dispatch(setCredentials({ user: resData.data.user, token: resData.data.token }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Please enter your email'); return; }
    try {
      setFpLoading(true);
      setFpError('');
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Failed to send code');
      setStep('forgot-code');
    } catch (err) {
      setFpError(err.message || 'Failed to send code');
    } finally {
      setFpLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!fpCode) { setFpError('Please enter the code'); return; }
    try {
      setFpLoading(true);
      setFpError('');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, code: fpCode }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Invalid code');
      setStep('forgot-reset');
    } catch (err) {
      setFpError(err.message || 'Invalid code');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!fpNewPassword || !fpConfirmPassword) { setFpError('Please fill all fields'); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match'); return; }
    if (fpNewPassword.length < 6) { setFpError('Password must be at least 6 characters'); return; }
    try {
      setFpLoading(true);
      setFpError('');
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, code: fpCode, newPassword: fpNewPassword }),
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) throw new Error(resData.message || 'Reset failed');
      setStep('forgot-done');
    } catch (err) {
      setFpError(err.message || 'Reset failed');
    } finally {
      setFpLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setStep('login');
    setFpEmail('');
    setFpCode('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpError('');
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  if (step === 'login') return (
    <Card>
      <Logo />
      <ErrorBox msg={error} />
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com" className={inputClass} required />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
            <button type="button" onClick={() => { setStep('forgot-email'); setFpError(''); }}
              className="text-xs text-indigo-600 font-semibold hover:underline">
              Forgot password?
            </button>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" className={inputClass} required />
        </div>
        <button type="submit" disabled={loading} className={`${btnClass} mt-6 active:bg-indigo-800`}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-8 text-center text-xs text-gray-500">
        <span>Don't have an account? </span>
        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register free</Link>
      </div>
    </Card>
  );

  // ─── FORGOT: STEP 1 — Enter email ─────────────────────────────────────────
  if (step === 'forgot-email') return (
    <Card>
      <BackButton onClick={resetForgotFlow} />
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
        <p className="text-xs text-gray-400 mt-1">We'll send a 6-digit code to your email</p>
      </div>
      <ErrorBox msg={fpError} />
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
            placeholder="name@example.com" className={inputClass} required />
        </div>
        <button type="submit" disabled={fpLoading} className={`${btnClass} mt-2`}>
          {fpLoading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
    </Card>
  );

  // ─── FORGOT: STEP 2 — Enter code ──────────────────────────────────────────
  if (step === 'forgot-code') return (
    <Card>
      <BackButton onClick={() => { setStep('forgot-email'); setFpError(''); }} />
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Enter Code</h2>
        <p className="text-xs text-gray-400 mt-1">Check your email for a 6-digit code</p>
        <p className="text-xs text-indigo-600 font-semibold mt-1">{fpEmail}</p>
      </div>
      <ErrorBox msg={fpError} />
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <label className={labelClass}>6-Digit Code</label>
          <input type="text" value={fpCode}
            onChange={(e) => setFpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456" maxLength={6}
            className={`${inputClass} text-center tracking-[0.5em] font-bold`} required />
        </div>
        <button type="submit" disabled={fpLoading || fpCode.length !== 6} className={`${btnClass} mt-2`}>
          {fpLoading ? 'Verifying...' : 'Verify Code'}
        </button>
        <button type="button" onClick={() => { setStep('forgot-email'); setFpError(''); }}
          className="w-full text-xs text-gray-400 hover:text-indigo-600 transition duration-150 text-center">
          Didn't get a code? Try again
        </button>
      </form>
    </Card>
  );

  // ─── FORGOT: STEP 3 — New password ────────────────────────────────────────
  if (step === 'forgot-reset') return (
    <Card>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mb-3">
          <LockKeyhole className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">New Password</h2>
        <p className="text-xs text-gray-400 mt-1">Choose a strong new password</p>
      </div>
      <ErrorBox msg={fpError} />
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className={labelClass}>New Password</label>
          <input type="password" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)}
            placeholder="Min 6 characters" className={inputClass} required minLength={6} />
        </div>
        <div>
          <label className={labelClass}>Confirm Password</label>
          <input type="password" value={fpConfirmPassword} onChange={(e) => setFpConfirmPassword(e.target.value)}
            placeholder="Repeat password" className={inputClass} required minLength={6} />
        </div>
        <button type="submit" disabled={fpLoading} className={`${btnClass} mt-2`}>
          {fpLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </Card>
  );

  // ─── FORGOT: DONE ──────────────────────────────────────────────────────────
  if (step === 'forgot-done') return (
    <Card>
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-xs text-gray-400 mb-8">Your password has been updated successfully. You can now sign in.</p>
        <button onClick={resetForgotFlow} className={btnClass}>
          Back to Sign In
        </button>
      </div>
    </Card>
  );
}