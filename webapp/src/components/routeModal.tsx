import { useEffect, useState } from "react";
import { Button, Card, Input } from "./ui";
import { Fingerprint, Plus, X } from "lucide-react";



const RouteModal = ({ isOpen, onClose, onSave, route }) => {
  const [formData, setFormData] = useState({
    name: '', path_prefix: '/', upstreams: [], methods: ['GET'], enabled: true,
    auth: { type: 'none' }, filters: [], host: '', headers: {}, query_params: {}
  });

  const [upstreamInput, setUpstreamInput] = useState('');
  // New state for filter addition
  const [filterName, setFilterName] = useState('');
  const [filterConfig, setFilterConfig] = useState('{"limit": 100}');

  useEffect(() => { 
    if (isOpen) {
      if (route) {
        setFormData(route);
        setUpstreamInput(route.upstreams ? route.upstreams.join(', ') : '');
      } else {
        setFormData({
          name: '', path_prefix: '/', upstreams: [], methods: ['GET'], enabled: true,
          auth: { type: 'none' }, filters: [], host: '', headers: {}, query_params: {}
        });
        setUpstreamInput('');
      }
      setFilterName('');
      setFilterConfig('{"limit": 100}');
    }
  }, [isOpen, route]);

  if (!isOpen) return null;

  const toggleMethod = (method) => {
    setFormData(prev => {
      const isSelected = prev.methods.includes(method);
      const newMethods = isSelected
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method].sort();
      return { ...prev, methods: newMethods };
    });
  };

  const handleSave = () => {
    const splitUpstreams = upstreamInput.split(',').map(u => u.trim()).filter(u => u.length > 0);
    onSave({ ...formData, upstreams: splitUpstreams });
  };
  
  // Filter Logic
  const addFilter = () => {
    if(!filterName) return;
    try {
        const config = JSON.parse(filterConfig);
        const newFilters = [...(formData.filters || []), { name: filterName, config }];
        setFormData({ ...formData, filters: newFilters });
        setFilterName('');
        setFilterConfig('{}');
    } catch(e) {
        alert("Invalid JSON configuration for filter");
    }
  };

  const removeFilter = (idx) => {
      const newFilters = [...(formData.filters || [])];
      newFilters.splice(idx, 1);
      setFormData({ ...formData, filters: newFilters });
  };

  const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
  const COMMON_FILTERS = ['rate_limit', 'cors', 'request_transformer', 'response_transformer', 'ip_restriction'];

  return (
    <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-slate-900">{route && route.id ? 'Edit Route' : 'Create New Route'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto">
           {/* Basic Info */}
           <Input label="Service Name" placeholder="e.g. User Service" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
           
           {/* Routing Rules */}
           <div className="grid grid-cols-2 gap-5">
             <Input label="Incoming Path Prefix" placeholder="/api/users" value={formData.path_prefix} onChange={e => setFormData({...formData, path_prefix: e.target.value})} />
             <Input label="Host (Optional)" placeholder="api.zentor.io" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} />
           </div>
           
           <Input 
             label="Upstreams (Comma Separated)" 
             placeholder="http://localhost:3000, http://localhost:3001" 
             value={upstreamInput} 
             onChange={e => setUpstreamInput(e.target.value)} 
           />
           
           {/* Methods */}
           <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1.5">Allowed HTTP Methods</label>
             <div className="flex flex-wrap gap-2">
                {METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMethod(m)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors border ${
                      formData.methods.includes(m)
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
             </div>
           </div>
           
           {/* Auth & Filters Section */}
           <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-6">
              {/* Authentication */}
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium flex items-center text-slate-700"><Fingerprint size={16} className="mr-2 text-slate-400"/> Authentication</span>
                 <select 
                   className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500" 
                   value={formData.auth?.type || 'none'}
                   onChange={e => setFormData({...formData, auth: { type: e.target.value }})}
                 >
                    <option value="none">None (Public)</option>
                    <option value="api_key">API Key</option>
                    <option value="jwt">JWT Bearer</option>
                 </select>
              </div>

              {/* Filters List */}
              <div className="border-t border-slate-200/60 pt-4">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Middleware Filters</label>
                 
                 {/* Existing Filters */}
                 <div className="space-y-2 mb-4">
                    {(formData.filters || []).map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                         <div className="flex items-center space-x-3 overflow-hidden">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{f.name}</span>
                            <span className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{JSON.stringify(f.config)}</span>
                         </div>
                         <button onClick={() => removeFilter(i)} className="text-slate-400 hover:text-rose-500 p-1"><X size={14}/></button>
                      </div>
                    ))}
                    {(!formData.filters || formData.filters.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-2">No active filters</p>
                    )}
                 </div>

                 {/* Add New Filter */}
                 <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                       <select 
                         className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                         value={filterName}
                         onChange={e => {
                           setFilterName(e.target.value);
                           // Pre-fill config template based on selection
                           if(e.target.value === 'rate_limit') setFilterConfig('{"limit": 100}');
                           else if(e.target.value === 'cors') setFilterConfig('{"allow_origins": "*"}');
                           else setFilterConfig('{}');
                         }}
                       >
                          <option value="">Select Filter...</option>
                          {COMMON_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                       <textarea 
                          className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 font-mono outline-none focus:border-indigo-500 h-16 resize-none"
                          placeholder='{"config": "value"}'
                          value={filterConfig}
                          onChange={e => setFilterConfig(e.target.value)}
                       />
                    </div>
                    <Button variant="secondary" className="h-full py-2 px-3" onClick={addFilter}>
                       <Plus size={16} />
                    </Button>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3 shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
    </Card>
  );
};


export default RouteModal