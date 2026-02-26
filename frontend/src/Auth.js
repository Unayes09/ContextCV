import React, { useState } from 'react';
import api from './api';
import { User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        onLogin();
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animated-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <Sparkles size={32} className="logo-icon-auth" />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your credentials to access your account' : 'Sign up to start building your portfolio'}</p>
        </div>
        
        {error && (
          <div className={`auth-error-msg ${error.includes('successful') ? 'success' : 'error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group-modern">
            <Mail size={18} className="input-icon-modern" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group-modern">
            <Lock size={18} className="input-icon-modern" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="auth-button-modern">
            <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-modern">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-link-modern">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
