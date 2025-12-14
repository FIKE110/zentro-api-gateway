import {  Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardView from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { Bell, ChevronRight, Cloud, FileJson, Gauge, LogOut, Menu, ScrollText, Search, Sliders, Terminal, Users, Waypoints, X } from "lucide-react";
import { Toast } from "./components/ui";
import RoutesView from "./pages/RoutesView";
import PlaygroundView from "./pages/PlaygroundView";
import FullConfigView from "./pages/FullConfigView";
import TrafficLogsView from "./pages/TrafficLogsView";
import AuthView from "./pages/AuthView";
import { useAuthStore } from "./store/authstore";
import SettingsView from "./pages/SettingsView";


const data= {
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


const data2=data

export default function App() {
  const location=useLocation()
  const {user,setUser,setToken}=useAuthStore()
  const [view, setView] = useState(location.pathname.replace("/",""));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(data2);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [isRouteModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const navigate=useNavigate()


  
  useEffect(() => {
    setTimeout(()=>setLoading(false),2000)
  }, [user]);

  if(!user){
    return(
      <Routes>
         <Route element={<AuthView />} path="/"/>
       </Routes>
    )
  }



  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Initializing Gateway...</p>
      </div>
    </div>
  );

  // If not authenticated, show Auth View
  // if (!user) {
  //   return <AuthView onLogin={setUser} />;
  // }

  const NavItem = ({ id, icon: Icon, label,link }) => (
    <button
      onClick={() => { setView(id); setSidebarOpen(false);navigate({pathname:link})}}
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
             <NavItem id="dashboard" icon={Gauge} label="Overview" link="/dashboard"/>
             <NavItem id="routes" icon={Waypoints} label="Routes" link="/routes"/>
           </nav>
        </div>

        <div className="px-6 py-2 mt-2">
           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Tools</div>
           <nav className="space-y-1">
             <NavItem id="playground" icon={Terminal} label="Playground" link="/playground"/>
             <NavItem id="logs" icon={ScrollText} label="Traffic Logs" link="/logs"/>
             <NavItem id="full-config" icon={FileJson} label="Full Config" link="/full-config"/>
             <NavItem id="settings" icon={Sliders} label="Settings" link="/settings"/>
           </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">{user && user.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-white">{user}</p>
              <p className="text-[10px] text-slate-400 truncate">{user}@zentor</p>
            </div>
            <LogOut size={14} className="text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={() => {
              setUser(null)
              setToken(null)
              navigate({
                pathname:"/"
              })
              }} />
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
            
              <Routes>
                <Route element={<DashboardView />} path="/dashboard"/>
                <Route element={<FullConfigView />} path="/full-config"/>
                <Route element={<TrafficLogsView />} path="/logs"/>
                <Route element={<SettingsView />} path="/settings"/>
                <Route element={<PlaygroundView />} path="/playground"/>
                 <Route element={<RoutesView  />} path="/routes"/>
              </Routes>
        
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>

  );
}