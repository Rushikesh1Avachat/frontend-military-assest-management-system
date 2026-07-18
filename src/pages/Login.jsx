import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      const msg = 'Please provide both email and password';
      setError(msg);
      // toast dynamically handled in other pages, but keep local state for inline error
      return;
    }

    try {
      await login(email, password);
      // toast should be triggered here but keep simple since ProtectedRoute already handles redirect
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill details for reviewers
  const handlePrefill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-[#0a0f1d]">
      {/* Dynamic glow design background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-military-accent/5 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-military-alert/3 rounded-full filter blur-[80px]" />

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Logo/Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-military-card border border-military-border/80 flex items-center justify-center text-military-accent mx-auto shadow-lg shadow-military-accent/10">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-military-text uppercase mt-4">
            MAMS <span className="text-military-accent">SECURE</span>
          </h1>
          <p className="text-xs text-military-textMuted uppercase font-mono tracking-widest">Command & Logistics Asset Grid</p>
        </div>

        {/* Login Form Card */}
        <div className="p-8 glass border border-military-border rounded-2xl shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-textMuted">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  placeholder="name@military.mil"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border focus:border-military-accent rounded-xl pl-10 pr-3 py-2.5 text-sm text-military-text placeholder-military-textMuted/45 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Security Access Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-textMuted">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border focus:border-military-accent rounded-xl pl-10 pr-3 py-2.5 text-sm text-military-text placeholder-military-textMuted/45 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-2 text-xs font-medium">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
className="w-full py-3 bg-military-accent hover:bg-military-accentHover text-white font-bold rounded-xl shadow-lg hover:shadow-military-accent/15 transition-all flex items-center justify-center gap-2 group text-sm disabled:opacity-80"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> decrypting keys...
                </>
              ) : (
                <>
                  Authenticate Node <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Quick Testing Credentials Panel */}
        <div className="p-5 bg-slate-900/60 border border-military-border/60 rounded-xl space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-military-border/50 pb-2">
            <span className="h-2 w-2 rounded-full bg-military-accent" />
            <h3 className="text-xs font-extrabold uppercase text-military-text tracking-widest">Test Clearance Credentials</h3>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => handlePrefill('admin@military.mil', 'AdminPass123')}
              className="w-full text-left p-2.5 bg-military-card/50 hover:bg-military-card border border-military-border rounded-lg text-xs flex justify-between items-center transition-all hover:border-slate-500 group"
            >
              <div>
                <strong className="text-military-text">Admin General</strong>
                <p className="text-[10px] text-military-textMuted mt-0.5">Full command authorization (all bases & logs)</p>
              </div>
              <span className="text-[10px] text-military-accent underline opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
            </button>

            <button 
              onClick={() => handlePrefill('commander.alpha@military.mil', 'CommanderPass123')}
              className="w-full text-left p-2.5 bg-military-card/50 hover:bg-military-card border border-military-border rounded-lg text-xs flex justify-between items-center transition-all hover:border-slate-500 group"
            >
              <div>
                <strong className="text-military-text">Base Commander (Alpha Base)</strong>
                <p className="text-[10px] text-military-textMuted mt-0.5">Manages only Alpha Base deployments</p>
              </div>
              <span className="text-[10px] text-military-accent underline opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
            </button>

            <button 
              onClick={() => handlePrefill('logistics@military.mil', 'LogisticsPass123')}
              className="w-full text-left p-2.5 bg-military-card/50 hover:bg-military-card border border-military-border rounded-lg text-xs flex justify-between items-center transition-all hover:border-slate-500 group"
            >
              <div>
                <strong className="text-military-text">Logistics Officer</strong>
                <p className="text-[10px] text-military-textMuted mt-0.5">Purchases and Transfers (no assignments/logs)</p>
              </div>
              <span className="text-[10px] text-military-accent underline opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
