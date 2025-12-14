import React, { useState } from 'react';
import { Terminal, Play, X, Loader } from 'lucide-react';
import { usePlaygroundRoutes } from '../hooks/usePlaygroundRoutes';
import { onTest } from '../services/playground';
import { useMutation } from '@tanstack/react-query';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className, ...props }) => {
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

const PlaygroundView = () => {
  const { data: routes, isLoading: routesLoading, error: routesError } = usePlaygroundRoutes();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState('{\n  \n}');


  const updateRow = (setter, list, index, field, val) => {
    const copy = [...list];
    copy[index][field] = val;
    setter(copy);
  };
  const addRow = (setter, list) => setter([...list, { key: "", value: "" }]);
  const removeRow = (setter, list, index) => setter(list.filter((_, i) => i !== index));

  const handleSend = async () => {
    setLoading(true);
    
    const headersObj = headers.reduce((acc, curr) => {
      if(curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});

    let finalUrl = url;
    const paramsString = queryParams
      .filter(p => p.key)
      .map(p => `${p.key}=${p.value}`)
      .join('&');
    if (paramsString) finalUrl += `?${paramsString}`;

    try {
        const res = await onTest(method, finalUrl, headersObj, method !== 'GET' ? body : null);
        setResponse(res);
    } catch(error) {
        setResponse({
            status: 500,
            statusText: "GATEWAY ERROR",
            headers: { "content-type": "application/json" },
            data: { error: "Failed to connect.", details: error.message }
        });
    } finally {
        setLoading(false);
    }
  };

  const TabButton = ({ id, label, count }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${ 
        activeTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
      }`}
    >
      {label} {count > 0 && <span className="ml-1 text-[10px] bg-slate-100 px-1.5 rounded-full">{count}</span>}
    </button>
  );

  const KeyValueRow = ({ data, index, list, setter }) => (
    <div className="flex space-x-2 mb-2">
       <input 
         placeholder="Key" 
         className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
         value={data.key}
         onChange={e => updateRow(setter, list, index, 'key', e.target.value)}
       />
       <input 
         placeholder="Value" 
         className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
         value={data.value}
         onChange={e => updateRow(setter, list, index, 'value', e.target.value)}
       />
       <button onClick={() => removeRow(setter, list, index)} className="text-slate-300 hover:text-rose-500"><X size={14}/></button>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Playground</h1>
        <p className="text-slate-500 text-sm mt-1">Test your gateway routes with simple request composition.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Request Panel */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center">
                  <Terminal size={14} className="mr-2" /> Request Composer
                </h3>
                <select 
                  className="bg-white border border-slate-200 text-xs rounded-md px-2 py-1 outline-none focus:border-indigo-500"
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={routesLoading}
                >
                  <option value="">
                    {routesLoading
                      ? "Loading routes..."
                      : routesError
                      ? "Error loading routes"
                      : "Load Route..."}
                  </option>
                  {routes && routes.map(r => <option key={r.id} value={r.path_prefix}>{r.name}</option>)}
                </select>
             </div>
             <div className="flex space-x-2">
                <select 
                  value={method} 
                  onChange={e => setMethod(e.target.value)}
                  className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
               >
                 <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
               </select>
               <input 
                 type="text" 
                 value={url}
                 onChange={e => setUrl(e.target.value)}
                 placeholder="http://gateway/api/..."
                 className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
               />
               <Button onClick={handleSend} disabled={loading} className="px-6">
                 {loading ? <span className="animate-spin"><Loader /> </span> : <Play size={16} fill="currentColor" />}
               </Button>
             </div>
          </div>

          <div className="border-b border-slate-100 px-2 flex space-x-1">
            <TabButton id="params" label="Params" count={queryParams.filter(p => p.key).length} />
            <TabButton id="headers" label="Headers" count={headers.filter(p => p.key).length} />
            <TabButton id="body" label="Body" count={0} />
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
             {activeTab === 'params' && (
               <div>
                 <div className="mb-3 text-xs text-slate-400 font-medium uppercase">Query Parameters</div>
                 {queryParams.map((p, i) => <KeyValueRow key={i} data={p} index={i} list={queryParams} setter={setQueryParams} />)}
                 <Button variant="secondary" className="h-8 text-xs mt-2" onClick={() => addRow(setQueryParams, queryParams)}>+ Add Param</Button>
               </div>
             )}
             {activeTab === 'headers' && (
               <div>
                 <div className="mb-3 text-xs text-slate-400 font-medium uppercase">Request Headers</div>
                 {headers.map((p, i) => <KeyValueRow key={i} data={p} index={i} list={headers} setter={setHeaders} />)}
                 <Button variant="secondary" className="h-8 text-xs mt-2" onClick={() => addRow(setHeaders, headers)}>+ Add Header</Button>
               </div>
             )}
             {activeTab === 'body' && (
               <div className="h-full flex flex-col">
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs text-slate-400 font-medium uppercase">Request Body (JSON)</span>
                    <span className="text-[10px] text-slate-400">application/json</span>
                  </div>
                  <textarea 
                    className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs outline-none resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  />
               </div>
             )}
          </div>
        </Card>

        {/* Response Panel */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 min-h-[300px] lg:min-h-0">
           <div className="p-4 border-b border-slate-800 flex items-center justify-between">
             <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-400">Response</h3>
             {response && (
               <div className="flex items-center space-x-3">
                 <span className={`px-2 py-0.5 rounded text-xs font-bold border ${ 
                   response.status < 300 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                 }`}>
                   {response.status} {response.statusText}
                 </span>
                 <span className="text-xs text-slate-500">124ms</span>
               </div>
             )}
           </div>
           <div className="flex-1 p-6 overflow-auto font-mono text-sm">
             {!response ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                 <Terminal size={48} className="mb-4 opacity-20" />
                 <p>Ready to send request</p>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Response Headers</div>
                    {Object.entries(response.headers).map(([k,v]) => (
                      <div key={k} className="flex text-xs">
                        <span className="text-indigo-400 w-32 shrink-0">{k}:</span>
                        <span className="text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                     <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Body</div>
                     <pre className="text-blue-300 whitespace-pre-wrap break-all">
                       {JSON.stringify(response.data, null, 2)}
                     </pre>
                  </div>
               </div>
             )}
           </div>
        </Card>
      </div>
    </div>
  );
};

export default PlaygroundView;
