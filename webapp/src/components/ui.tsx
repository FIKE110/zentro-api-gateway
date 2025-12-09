import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600/90 backdrop-blur text-white border-emerald-500",
    error: "bg-rose-600/90 backdrop-blur text-white border-rose-500",
    info: "bg-slate-800/90 backdrop-blur text-white border-slate-700"
  };

  return (
    <div className={`fixed bottom-6 right-6 ${styles[type] || styles.info} px-5 py-3 rounded-xl shadow-xl border flex items-center space-x-3 animate-in slide-in-from-bottom-5 fade-in z-50`}>
      {type === 'success' && <CheckCircle2 size={18} />}
      {type === 'error' && <XCircle size={18} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
    {active ? 'Enabled' : 'Disabled'}
  </span>
);

export const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
      {...props}
    />
  </div>
);

export const Button = ({ children, variant = "primary", className, ...props }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-200",
    ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
  };
  
  return (
    <button 
      className={`h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};