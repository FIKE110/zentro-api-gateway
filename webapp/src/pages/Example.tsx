import React, { useState, useEffect } from 'react';
import { 
  // Navigation & Core
  Gauge,          // Dashboard
  Waypoints,      // Routes
  ScrollText,     // Logs
  Terminal,       // Playground
  Sliders,        // Settings
  Users,          // Consumers
  
  // Actions & UI
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Menu,
  X,
  Save,
  Bell,
  LogOut,
  Search,
  ChevronRight,
  ArrowRight,
  Copy,
  Key,
  ChevronDown,
  Play,
  Lock,           // Auth
  Mail,           // Auth
  FileJson,       // New for Full Config
  
  // Metrics & Plugins
  Zap,            // Latency
  ShieldCheck,    // Security
  Timer,          // Rate Limiting
  AlertCircle,    // Errors
  BarChart3,      // Traffic
  Cloud,          // Gateway
  Cpu,            // Resources
  Server,         // Upstream
  Fingerprint,    // Auth
  Globe,          // Network
} from 'lucide-react';

/* --- ARCHITECTURE NOTES ---
   To integrate with Go API:
   1. Replace `mockApi` methods with `fetch()` calls.
   2. Ensure Go API returns JSON matching `INITIAL_DATA`.
   3. Replace auth logic with real JWT handling.
*/

// --- MOCK BACKEND SERVICE ---
const INITIAL_DATA = {
  settings: {
    gateway_name: "Zentor Gateway",
    port: 8080,
    global_rate_limit: 10000,
    admin_email: "dev@localhost",
    cors_enabled: true,
    environment: "development"
  },
  routes: [
    {
      id: "r_01",
      name: "Local Auth Service",
      path_prefix: "/api/auth",
      upstreams: ["http://localhost:3001"],
      methods: ["POST"],
      enabled: true,
      auth: { type: "none" },
      filters: [{ name: "rate_limit", config: { limit: 60 } }],
      host: "",
      headers: {},
      query_params: {}
    },
    {
      id: "r_02",
      name: "User Profile API",
      path_prefix: "/api/users",
      upstreams: ["http://localhost:3002", "http://localhost:3003"],
      methods: ["GET", "POST"],
      enabled: true,
      auth: { type: "api_key" },
      filters: [{ name: "rate_limit", config: { limit: 100 } }],
      host: "api.zentor.io",
      headers: { "x-version": "v2" },
      query_params: {}
    }
  ],
  consumers: [
    { id: "c_1", username: "frontend-app-local", api_key: "sk_test_83749283", created_at: "2023-10-01", rate_limit: 1000 },
    { id: "c_2", username: "cli-tool", api_key: "sk_test_99283412", created_at: "2023-10-05", rate_limit: 5000 },
  ],
  metrics: {
    total_requests: 842,
    requests_per_minute: 45,
    avg_latency_ms: 12,
    error_rate_percent: 0.2,
    cpu_usage: 12,
    memory_usage: 64,
    traffic_history: [
       { time: "10:00", count: 20 }, { time: "10:10", count: 45 }, 
       { time: "10:20", count: 30 }, { time: "10:30", count: 80 }, 
       { time: "10:40", count: 55 }, { time: "10:50", count: 60 }
    ]
  },
  logs: [
    { id: 1, method: "GET", path: "/api/users", status: 200, latency: 15, ip: "::1", time: "10:30:01" },
    { id: 2, method: "POST", path: "/api/auth", status: 401, latency: 8, ip: "::1", time: "10:30:05" },
    { id: 3, method: "GET", path: "/api/users/me", status: 200, latency: 12, ip: "::1", time: "10:31:12" },
    { id: 4, method: "POST", path: "/api/users", status: 201, latency: 45, ip: "::1", time: "10:31:45" },
  ]
};

const mockApi = {
  login: (username, password) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password.length >= 4) {
        resolve({ id: "u_1", name: username, email: "admin@zentor.io", token: "jwt_mock_token" });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000);
  }),
  register: (username, password) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username && password.length >= 4) {
        resolve({ id: "u_2", name: username, email: "user@zentor.io", token: "jwt_mock_token" });
      } else {
        reject(new Error("Invalid details"));
      }
    }, 1000);
  }),
  fetchData: () => new Promise(resolve => setTimeout(() => resolve(INITIAL_DATA), 800)),
  updateSettings: (newSettings) => new Promise(resolve => setTimeout(() => resolve({ success: true }), 600)),
  updateFullConfig: (newConfig) => new Promise(resolve => setTimeout(() => resolve(newConfig), 1000)),
  saveRoute: (route) => new Promise(resolve => setTimeout(() => resolve({ ...route, id: route.id || `r_${Date.now()}` }), 500)),
  deleteRoute: (id) => new Promise(resolve => setTimeout(() => resolve(true), 400)),
  createConsumer: (consumer) => new Promise(resolve => setTimeout(() => resolve({ ...consumer, id: `c_${Date.now()}`, created_at: new Date().toISOString().split('T')[0] }), 500)),
  deleteConsumer: (id) => new Promise(resolve => setTimeout(() => resolve(true), 400)),
  testEndpoint: (method, url, headers, body) => new Promise(resolve => setTimeout(() => resolve({ 
    status: 200, 
    statusText: "OK",
    headers: { "content-type": "application/json", "x-powered-by": "Zentor", ...headers },
    data: { message: "Request received!", method, url, received_headers: headers, received_body: body ? JSON.parse(body) : null } 
  }), 600))
};

// --- UI COMPONENTS ---

const Toast = ({ message, type, onClose }) => {
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

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Badge = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
    {active ? 'Enabled' : 'Disabled'}
  </span>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400"
      {...props}
    />
  </div>
);

const Button = ({ children, variant = "primary", className, ...props }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200",
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

// --- AUTH VIEWS ---

const AuthView = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await mockApi.login(username, password);
      } else {
        user = await mockApi.register(username, password);
      }
      onLogin(user);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-900/20 text-white">Z</div>
             <span className="text-xl font-bold tracking-tight">Zentor</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Secure, Scalable <br/> API Management.
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Control traffic, manage consumers, and monitor your microservices architecture with a developer-first gateway.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="mb-3 text-emerald-400" size={24} />
              <h3 className="font-bold text-sm mb-1">Enterprise Security</h3>
              <p className="text-xs text-slate-400">JWT, API Keys, and ACLs built-in.</p>
           </div>
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <Zap className="mb-3 text-amber-400" size={24} />
              <h3 className="font-bold text-sm mb-1">Low Latency</h3>
              <p className="text-xs text-slate-400">Engineered for high-throughput routing.</p>
           </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 mt-12">
           © 2024 Zentor Inc. All rights reserved.
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
         <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                 {isLogin ? 'Welcome back' : 'Create an account'}
               </h2>
               <p className="text-slate-500 text-sm">
                 {isLogin ? 'Enter your username to access the dashboard.' : 'Get started with your first gateway instance.'}
               </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100 flex items-center">
                <AlertCircle size={16} className="mr-2" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                 <div className="relative">
                   <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-slate-700 placeholder:text-slate-400"
                     placeholder="admin"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                 <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="password"
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-slate-700 placeholder:text-slate-400"
                     placeholder="••••••••"
                   />
                 </div>
                 {isLogin && <div className="text-right"><a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a></div>}
               </div>

               <Button className="w-full h-11" disabled={loading}>
                 {loading ? <span className="animate-spin mr-2">⏳</span> : null}
                 {isLogin ? 'Sign In' : 'Create Account'}
               </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400">Or continue with</span></div>
            </div>

            <div className="text-center text-sm">
               <span className="text-slate-500">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(null); }}
                 className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
               >
                 {isLogin ? 'Sign up' : 'Log in'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- VIEWS ---

const FullConfigView = ({ data, onSave }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize with current config (strip metrics/logs for editing)
  useEffect(() => {
    const { metrics, logs, ...config } = data;
    setJsonText(JSON.stringify(config, null, 2));
  }, [data]);

  const handleSave = () => {
    setError(null);
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      // Basic validation
      if (!parsed.settings || !parsed.routes) {
        throw new Error("Invalid config: 'settings' and 'routes' are required.");
      }
      onSave(parsed).then(() => setLoading(false));
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Full Configuration</h1>
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

const DashboardView = ({ data }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Requests", value: data.metrics.total_requests.toLocaleString(), icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Avg Latency", value: `${data.metrics.avg_latency_ms}ms`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Error Rate", value: `${data.metrics.error_rate_percent}%`, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Active Routes", value: data.routes.filter(r => r.enabled).length, icon: Waypoints, color: "text-emerald-600", bg: "bg-emerald-50" }
      ].map((stat, idx) => (
        <Card key={idx} className="p-5 flex items-center justify-between group cursor-default">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-indigo-600 transition-colors">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
            <stat.icon size={22} strokeWidth={2} />
          </div>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
             <BarChart3 size={20} className="mr-2 text-slate-400" /> Traffic Overview
          </h2>
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1 text-xs font-medium bg-white text-slate-800 rounded-md shadow-sm">1H</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900">24H</button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between space-x-2 sm:space-x-4">
           {data.metrics.traffic_history.map((point, i) => {
             const height = Math.max(10, (point.count / 100) * 100); 
             return (
               <div key={i} className="flex-1 flex flex-col items-center group relative">
                 <div 
                   className="w-full bg-indigo-500/80 rounded-t-md group-hover:bg-indigo-600 transition-all duration-300 relative overflow-hidden" 
                   style={{ height: `${height}%` }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                 </div>
                 <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity -translate-y-1 group-hover:translate-y-0 duration-200 pointer-events-none">
                   {point.count} reqs
                 </div>
                 <span className="text-[10px] text-slate-400 mt-3 font-medium">{point.time}</span>
               </div>
             )
           })}
        </div>
      </Card>

      <Card className="p-6 flex flex-col">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
          <Gauge size={20} className="mr-2 text-slate-400" /> System Status
        </h2>
        <div className="space-y-8 flex-1">
          {[
            { label: "CPU Usage", value: data.metrics.cpu_usage, icon: Cpu, color: "bg-indigo-500" },
            { label: "Memory", value: 30, icon: Server, color: "bg-emerald-500" }
          ].map((metric, i) => (
             <div key={i}>
              <div className="flex justify-between text-sm mb-2.5">
                <span className="text-slate-500 font-medium flex items-center">
                  <metric.icon size={14} className="mr-2 text-slate-400"/> {metric.label}
                </span>
                <span className="font-bold text-slate-700">{i === 1 ? `${data.metrics.memory_usage}MB` : `${metric.value}%`}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${metric.color} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
               <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-emerald-900">System Online</p>
                 <p className="text-[10px] text-emerald-700/70">Uptime: 2h 15m</p>
               </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const RoutesView = ({ routes, onEdit, onDelete, onToggle }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Route Management</h1>
        <p className="text-slate-500 text-sm mt-1">Configure traffic rules and upstream services.</p>
      </div>
      <Button onClick={() => onEdit(null)}>
        <Plus size={18} />
        <span>New Route</span>
      </Button>
    </div>

    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Name</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Upstreams</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Middleware</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {routes.map(route => {
              const rateLimitFilter = route.filters?.find(f => f.name === 'rate_limit');
              
              return (
              <tr key={route.id} className="group hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                   <button onClick={() => onToggle(route.id, !route.enabled)} className="focus:outline-none">
                     <Badge active={route.enabled} />
                   </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">{route.name}</span>
                    <div className="flex items-center mt-1 space-x-2">
                       {route.host && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">Host: {route.host}</span>}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-mono border border-indigo-100/50">{route.path_prefix}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {route.upstreams.map((up, i) => (
                      <div key={i} className="flex items-center text-sm text-slate-500 font-mono">
                        <ArrowRight size={12} className="mr-2 text-slate-300" />
                        {up}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {route.auth?.type !== 'none' && (
                      <div className="group/icon relative">
                        <Fingerprint size={16} className="text-slate-400 hover:text-indigo-500 transition-colors" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          Auth: {route.auth.type}
                        </span>
                      </div>
                    )}
                    {rateLimitFilter && <Timer size={16} className="text-slate-400 hover:text-amber-500 transition-colors" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full" onClick={() => onEdit(route)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => onDelete(route.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {routes.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Waypoints size={32} className="text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-medium mb-1">No routes configured</h3>
          <p className="text-slate-500 text-sm">Get started by creating your first upstream proxy.</p>
        </div>
      )}
    </Card>
  </div>
);

const ConsumersView = ({ consumers, onCreate, onDelete }) => {
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

const PlaygroundView = ({ routes }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Request Data States
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState('{\n  \n}');

  // Handlers for dynamic input fields
  const updateRow = (setter, list, index, field, val) => {
    const copy = [...list];
    copy[index][field] = val;
    setter(copy);
  };
  const addRow = (setter, list) => setter([...list, { key: "", value: "" }]);
  const removeRow = (setter, list, index) => setter(list.filter((_, i) => i !== index));

  const handleSend = async () => {
    setLoading(true);
    
    // Construct headers object
    const headersObj = headers.reduce((acc, curr) => {
      if(curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Construct URL with params
    let finalUrl = url;
    const paramsString = queryParams
      .filter(p => p.key)
      .map(p => `${p.key}=${p.value}`)
      .join('&');
    if (paramsString) finalUrl += `?${paramsString}`;

    try {
        const res = await mockApi.testEndpoint(method, finalUrl, headersObj, method !== 'GET' ? body : null);
        setResponse(res);
    } catch(error) {
        setResponse({
            status: 500,
            statusText: "GATEWAY ERROR",
            headers: { "content-type": "application/json" },
            data: { error: "Failed to connect to gateway mock endpoint.", details: error.message }
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
        <p className="text-slate-500 text-sm mt-1">Test your gateway routes with advanced request composition.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Request Panel */}
        <Card className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* URL Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center">
                  <Terminal size={14} className="mr-2" /> Request Composer
                </h3>
                <select 
                  className="bg-white border border-slate-200 text-xs rounded-md px-2 py-1 outline-none focus:border-indigo-500"
                  onChange={(e) => setUrl(e.target.value)}
                >
                  <option value="">Load Route...</option>
                  {routes.map(r => <option key={r.id} value={r.path_prefix}>{r.name}</option>)}
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
                 {loading ? <span className="animate-spin">⏳</span> : <Play size={16} fill="currentColor" />}
               </Button>
             </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-100 px-2 flex space-x-1">
            <TabButton id="params" label="Params" count={queryParams.filter(p => p.key).length} />
            <TabButton id="headers" label="Headers" count={headers.filter(p => p.key).length} />
            <TabButton id="body" label="Body" count={0} />
          </div>
          
          {/* Tab Content */}
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

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null); // Auth State
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [isRouteModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  
  useEffect(() => {
    // Simulate checking auth token on load (optional)
    // const token = localStorage.getItem('token');
    // if (token) setUser({ name: 'Returning User' });

    mockApi.fetchData().then(res => { setData(res); setLoading(false); });
  }, []);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Data Handlers
  const handleRouteSave = async (route) => {
    const saved = await mockApi.saveRoute(route);
    setData(prev => {
      const exists = prev.routes.find(r => r.id === saved.id);
      const newRoutes = exists ? prev.routes.map(r => r.id === saved.id ? saved : r) : [...prev.routes, saved];
      return { ...prev, routes: newRoutes };
    });
    setRouteModalOpen(false);
    showToast(editingRoute ? "Route updated" : "Route created");
  };

  const handleRouteDelete = async (id) => {
    if(!window.confirm("Delete this route?")) return;
    await mockApi.deleteRoute(id);
    setData(prev => ({ ...prev, routes: prev.routes.filter(r => r.id !== id) }));
    showToast("Route deleted", "error");
  };

  const handleSettingsUpdate = async (newSettings) => {
    await mockApi.updateSettings(newSettings);
    setData(prev => ({ ...prev, settings: newSettings }));
    showToast("Configuration saved");
  };

  const handleFullConfigUpdate = async (newConfig) => {
    const updated = await mockApi.updateFullConfig(newConfig);
    // Merge runtime data back
    setData(prev => ({
      ...updated,
      metrics: prev.metrics,
      logs: prev.logs
    }));
    showToast("Full configuration loaded");
  };

  const handleConsumerCreate = async (consumer) => {
    const saved = await mockApi.createConsumer(consumer);
    setData(prev => ({ ...prev, consumers: [...prev.consumers, saved] }));
    showToast("Consumer added");
  };

  const handleConsumerDelete = async (id) => {
    if(!window.confirm("Revoke access for this consumer?")) return;
    await mockApi.deleteConsumer(id);
    setData(prev => ({ ...prev, consumers: prev.consumers.filter(c => c.id !== id) }));
    showToast("Consumer revoked", "info");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Initializing Gateway...</p>
      </div>
    </div>
  );

  // If not authenticated, show Auth View
  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setView(id); setSidebarOpen(false); }}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        view === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      <Icon size={18} className={view === id ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-900/20 text-white">Z</div>
            <div>
               <span className="block text-lg font-bold tracking-tight leading-none">Zentor</span>
               <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">API Gateway</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-2">
           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Main Menu</div>
           <nav className="space-y-1">
             <NavItem id="dashboard" icon={Gauge} label="Overview" />
             <NavItem id="routes" icon={Waypoints} label="Routes" />
             <NavItem id="consumers" icon={Users} label="Consumers" />
           </nav>
        </div>

        <div className="px-6 py-2 mt-2">
           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Tools</div>
           <nav className="space-y-1">
             <NavItem id="playground" icon={Terminal} label="Playground" />
             <NavItem id="logs" icon={ScrollText} label="Traffic Logs" />
             <NavItem id="full-config" icon={FileJson} label="Full Config" />
             <NavItem id="settings" icon={Sliders} label="Settings" />
           </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
            <LogOut size={14} className="text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={() => setUser(null)} />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
        {/* Header */}
        <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-slate-500 hover:text-slate-900">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center text-sm text-slate-500">
              <Cloud size={14} className="mr-2"/>
              <span>{data.settings.gateway_name}</span>
              <ChevronRight size={14} className="mx-2 text-slate-300"/>
              <span className="font-medium text-slate-900 capitalize">{view}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
               <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-full text-xs outline-none transition-all w-48" />
             </div>
             <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
             <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {view === 'dashboard' && <DashboardView data={data} />}
            {view === 'settings' && <SettingsView settings={data.settings} onUpdate={handleSettingsUpdate} />}
            {view === 'routes' && (
              <RoutesView 
                routes={data.routes} 
                onEdit={(r) => { setEditingRoute(r); setRouteModalOpen(true); }}
                onDelete={handleRouteDelete}
                onToggle={(id, status) => {
                  const updated = data.routes.map(r => r.id === id ? {...r, enabled: status} : r);
                  setData({...data, routes: updated});
                }}
              />
            )}
            {view === 'consumers' && <ConsumersView consumers={data.consumers} onCreate={handleConsumerCreate} onDelete={handleConsumerDelete} />}
            {view === 'playground' && <PlaygroundView routes={data.routes} />}
            {view === 'full-config' && <FullConfigView data={data} onSave={handleFullConfigUpdate} />}
            {view === 'logs' && (
               <Card>
                 <div className="p-6 border-b border-slate-100"><h2 className="font-bold text-slate-900 flex items-center"><ScrollText size={18} className="mr-2 text-slate-400" /> Recent Traffic Logs</h2></div>
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                       <tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Method</th><th className="px-6 py-4">Path</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Latency</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {data.logs.map(log => (
                         <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{log.time}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.method === 'GET' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.method}</span></td>
                            <td className="px-6 py-4 text-slate-700 font-medium">{log.path}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${log.status === 200 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{log.status}</span></td>
                            <td className="px-6 py-4 font-mono text-xs">{log.latency}ms</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <RouteModal 
            isOpen={isRouteModalOpen} 
            onClose={() => setRouteModalOpen(false)} 
            onSave={handleRouteSave} 
            route={editingRoute} 
          />
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// --- Helper Components moved to bottom to keep file clean ---

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