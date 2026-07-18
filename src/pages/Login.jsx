import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, KeyRound } from 'lucide-react';

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

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-military-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-3xl font-bold text-center text-military-primary mb-8">
            Military Asset Management System
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-military-text mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-military-text mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-muted">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-military-border">
            <h3 className="text-white font-semibold mb-4 text-sm">Demo Credentials:</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-military-bg p-3 rounded border border-military-border">
                <p className="text-military-muted">Admin:</p>
                <p className="text-military-text">admin@military.com</p>
                <p className="text-military-muted">Admin@123</p>
              </div>
              <div className="bg-military-bg p-3 rounded border border-military-border">
                <p className="text-military-muted">Commander:</p>
                <p className="text-military-text">commander@military.com</p>
                <p className="text-military-muted">Commander@123</p>
              </div>
              <div className="bg-military-bg p-3 rounded border border-military-border">
                <p className="text-military-muted">Logistics:</p>
                <p className="text-military-text">logistics@military.com</p>
                <p className="text-military-muted">Logistics@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
