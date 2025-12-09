import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, FileJson } from 'lucide-react';
import fetchFullConfig, { updateFullConfig } from '../services/full-config';
import { useMutation, useQuery } from '@tanstack/react-query';

const Card = ({ children, className = "" }:{children:any,className:string}) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className, ...props }:{children:any,variant:"primary",className:string,onClick:Function,disabled:boolean}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
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

const FullConfigView = () => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data, isLoading, isError, refetch,status } = useQuery({
    queryKey: ['config'],
    queryFn: fetchFullConfig,
    refetchInterval: 2000,
  })

  const mutate=useMutation({
    mutationFn:updateFullConfig,
    mutationKey:['configmut'],
    onSuccess:()=>{refetch()}
  })

  const onSave=(body:any)=>{
    mutate.mutate(JSON.stringify(body,null, 2))
    setLoading(false)
  }

  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleSave = () => {
    setError(null);
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.routes) {
        throw new Error("Invalid config: 'settings' and 'routes' are required.");
      }
      onSave(parsed);
    } catch (err) {
      setLoading(false);
      setError(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <FileJson size={24} className="mr-2 text-slate-400" />
            Full Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-1">Directly edit the gateway state via JSON.</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <span className="animate-spin mr-2">⏳</span> : <Save size={16} />}
          <span>Save Configuration</span>
        </Button>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden min-h-[500px]">
        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm p-4 border-b border-rose-100 flex items-center">
            <AlertCircle size={16} className="mr-2" /> 
            <span className="font-mono">{error}</span>
          </div>
        )}
        <div className="flex-1 relative bg-slate-900">
           <div className="absolute top-4 right-4 z-10">
              <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">JSON</span>
           </div>
           <textarea 
             className="w-full h-full bg-transparent text-slate-200 font-mono text-xs p-6 outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
             value={jsonText}
             onChange={e => setJsonText(e.target.value)}
             spellCheck="false"
           />
        </div>
      </Card>
      
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900">
         <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
         <div>
           <p className="font-bold">Advanced Use Only</p>
           <p className="text-amber-700/80">Updating the full configuration will overwrite all existing routes and settings. Runtime metrics and logs will be preserved.</p>
         </div>
      </div>
    </div>
  );
};

export default FullConfigView;