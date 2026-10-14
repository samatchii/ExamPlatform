import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export const PrivateRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const normalizedRoles = roles.map(r => r.toUpperCase());
  if (roles.length && !normalizedRoles.includes((user.role || '').toUpperCase()))
    return <Navigate to="/dashboard" replace />;
  return children;
};

export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const LevelBadge = ({ level }) => {
  const colors = { 
    'Débutant': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', 
    'Intermédiaire': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', 
    'Avancé': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' 
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border-2 shadow-sm ${colors[level] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
      {level === 'Débutant' ? '\u{1F331}' : level === 'Intermédiaire' ? '\u{1F4C8}' : level === 'Avancé' ? '\u{1F525}' : ''} {level}
    </span>
  );
};

export const ScoreBadge = ({ score, passing }) => {
  const passed = score >= passing;
  return (
    <span className={`text-sm font-bold px-4 py-1.5 rounded-full border shadow-sm ${
      passed 
        ? 'bg-success/10 text-success border-success/20 dark:bg-success/20 dark:border-success/30' 
        : 'bg-danger/10 text-danger border-danger/20 dark:bg-danger/20 dark:border-danger/30'
    }`}>
      {score}% {passed ? '\u2713' : '\u2717'}
    </span>
  );
};

export const Spinner = ({ size = 'large' }) => {
  const dimensions = size === 'small' ? 'w-6 h-6 border-2' : size === 'medium' ? 'w-8 h-8 border-3' : 'w-12 h-12 border-4';
  return (
    <div className="flex justify-center items-center p-8 w-full">
      <div className={`${dimensions} border-primary-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}></div>
);

export const Card = ({ children, className = '', hover = true }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : 'shadow-sm'} ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-primary-500",
    secondary: "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-500 hover:shadow-md focus:ring-primary-500",
    danger: "bg-danger hover:bg-red-600 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500",
    outline: "bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
