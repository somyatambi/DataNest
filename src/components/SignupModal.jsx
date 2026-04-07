import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SignupModal({ onClose, onSwitchToLogin }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    const result = await signup({ name: form.name, email: form.email, company: form.company, password: form.password });
    if (!result.success) setError(result.error || 'Signup failed');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md relative my-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl leading-none">×</button>
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center font-bold text-black text-lg mx-auto mb-3">D</div>
          <h2 className="text-white text-2xl font-bold">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Register on DataNest</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Full Name</label>
            <input type="text" required placeholder="John Doe"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Email Address</label>
            <input type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Company Name <span className="text-gray-500">(optional)</span></label>
            <input type="text" placeholder="Your Business"
              value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input type="password" required placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-1">Confirm Password</label>
            <input type="password" required placeholder="Repeat password"
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-lg transition">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-green-400 hover:text-green-300 font-medium">Log in</button>
        </p>
      </div>
    </div>
  );
}

export default SignupModal;
