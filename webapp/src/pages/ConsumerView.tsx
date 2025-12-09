import React, { useState } from 'react';
import { Plus, Trash2, Users, Key, X } from 'lucide-react';

const Card = ({ children, className = "" }:any) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className, ...props }:any) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
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

const Input = ({ label, ...props }:any) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
      {...props}
    />
  </div>
);

const ConsumersView = ({ consumers, onCreate, onDelete }:any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConsumer, setNewConsumer] = useState({ username: '', api_key: `sk_test_${Math.random().toString(36).substr(2, 9)}` });

  const handleSubmit = () => {
    onCreate(newConsumer);
    setIsModalOpen(false);
    setNewConsumer({ username: '', api_key: `sk_test_${Math.random().toString(36).substr(2, 9)}` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Consumers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage API keys and access controls.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add Consumer</span>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consumer ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {consumers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{c.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 bg-slate-100 w-fit px-2 py-1 rounded border border-slate-200">
                      <Key size={12} className="text-slate-400" />
                      <code className="text-xs font-mono text-slate-600">{c.api_key.substring(0, 12)}...</code>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.created_at}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full text-rose-400 hover:text-rose-600" onClick={() => onDelete(c.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Consumer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Create API Consumer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Username / App Name" placeholder="e.g. mobile-client-v2" value={newConsumer.username} onChange={e => setNewConsumer({...newConsumer, username: e.target.value})} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5">Generated API Key</label>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-sm text-slate-600">
                    {newConsumer.api_key}
                  </div>
                  <Button variant="secondary" onClick={() => setNewConsumer({...newConsumer, api_key: `sk_test_${Math.random().toString(36).substr(2, 9)}`})}>
                     Regen
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Create Consumer</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConsumersView;