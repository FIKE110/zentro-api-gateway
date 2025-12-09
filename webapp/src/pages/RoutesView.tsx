import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Waypoints, Fingerprint, Timer, 
  ArrowRight, Globe, Search, ListFilter, Network, ShieldCheck,
  Copy, MoreHorizontal, Layers, CheckCircle2, AlertCircle, AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoutes, type Route } from '../services/routes';
import RouteModal from '../components/routeModal';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
    {active ? 'Active' : 'Disabled'}
  </span>
);

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-blue-50 text-blue-700 border-blue-200',
    POST: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PUT: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
    PATCH: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  const defaultColor = 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${colors[method] || defaultColor}`}>
      {method}
    </span>
  );
};

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

const KeyValueDisplay = ({ icon: Icon, data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const entries = Object.entries(data);
  const displayCount = 2;
  const hasMore = entries.length > displayCount;

  return (
    <div className="flex flex-col gap-1 mt-1">
      {entries.slice(0, displayCount).map(([k, v], i) => (
        <div key={i} className="flex items-center text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit max-w-full">
          <Icon size={10} className="mr-1.5 text-slate-400 shrink-0" />
          <span className="font-mono truncate max-w-[80px]">{k}:</span>
          <span className="font-mono ml-1 text-slate-700 truncate max-w-[100px]">{v}</span>
        </div>
      ))}
      {hasMore && (
        <span className="text-[10px] text-slate-400 pl-1">+{entries.length - displayCount} more...</span>
      )}
    </div>
  );
};

const FilterBadge = ({ name }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600">
    <Layers size={10} className="text-slate-400" />
    <span className="text-[10px] font-medium font-mono">{name}</span>
  </div>
);

// Helper to deterministically mock upstream status based on URL string
const getMockUpstreamStatus = (url) => {
  if (!url) return 'down';
  // Use char code sum to decide status so it persists across renders but looks random
  const sum = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Simulating that roughly 1 in 4 upstreams might be down
  return sum % 4 === 0 ? 'down' : 'up';
};

// Helper to deterministically mock filter configuration status
const getMockFilterStatus = (routeId:string) => {
  // Simulate a warning state for routes starting with 'route_9' (Legacy User Data)
  return 'ok'
  return routeId.startsWith('route_9') ? 'warning' : 'ok';
}

function RoutesView ({ onEdit, onDelete, onDuplicate, onToggle }){
  const { data:routes, isLoading, isError } = useQuery<Route[]>({
  queryKey: ["routes"],
  queryFn: fetchAllRoutes,
  refetchInterval:2000
});

const [editingRoute, setEditingRoute] = useState(null);
const [isRouteModalOpen,setRouteModalOpen]=useState(false)


const handleRouteSave = async (route) => {
    // const saved = await mockApi.saveRoute(route);
    // setData(prev => {
    //   const exists = prev.routes.find(r => r.id === saved.id);
    //   const newRoutes = exists ? prev.routes.map(r => r.id === saved.id ? saved : r) : [...prev.routes, saved];
    //   return { ...prev, routes: newRoutes };
    // });
    setRouteModalOpen(false);
    // showToast(editingRoute ? "Route updated" : "Route created");
  };

  const handleRouteDelete = async (id) => {
    if(!window.confirm("Delete this route?")) return;
    // await mockApi.deleteRoute(id);
    // setData(prev => ({ ...prev, routes: prev.routes.filter(r => r.id !== id) }));
    // showToast("Route deleted", "error");
  };





  
  return (
  
  <div className="space-y-6 animate-in fade-in duration-500 p-6 max-w-[1600px] mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Route Management</h1>
        <p className="text-slate-500 text-sm mt-1">Configure traffic rules, load balancers, and upstream services.</p>
      </div>
      <Button onClick={() => 
        {
          setRouteModalOpen(true)
          onEdit && onEdit(null)
          }}>
        <Plus size={18} />
        <span>New Route</span>
      </Button>
    </div>

    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Status</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-1/3">Matching Rules</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upstreams & LB</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Policies</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {routes && routes.map(route => {
              const hasLb = "round-robin";
              const upstreamLimit = 3;
              const extraUpstreams = route.upstreams?.length > upstreamLimit ? route.upstreams.length - upstreamLimit : 0;
              
              const filterLimit = 2;
              const extraFilters = route.filters?.length!! > filterLimit ? route.filters!!.length - filterLimit : 0;
              const filterStatus = getMockFilterStatus(route.id);
              const isFilterWarning = filterStatus === 'warning';
              
              const filterBadgeClass = isFilterWarning 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-600';
              const filterIconClass = isFilterWarning ? 'text-amber-500' : 'text-indigo-400';

              return (
              <tr key={route.id} className="group hover:bg-slate-50/80 transition-colors">
                {/* Status Toggle */}
                <td className="px-6 py-4 align-top">
                   <button onClick={() => onToggle && onToggle(route.id, !route.enabled)} className="focus:outline-none">
                     <StatusBadge active={route.enabled} />
                   </button>
                </td>

                {/* Matching Rules (Name, Methods, Path, Headers, Query) */}
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 text-sm">{route.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono select-all">ID: {route.id}</span>
                    </div>

                    {/* Methods & Path */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {route.methods && route.methods.length > 0 ? (
                        <div className="flex gap-1">
                          {route.methods.map(m => <MethodBadge key={m} method={m} />)}
                        </div>
                      ) : (
                         <span className="text-[10px] text-slate-400 font-mono uppercase">Any Method</span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-mono border border-indigo-100/50">
                        {route.path_prefix || "/"}
                      </span>
                    </div>

                    {/* Advanced Matchers */}
                    <div className="space-y-1">
                      {route.host && (
                        <div className="flex items-center text-[10px] text-slate-500">
                           <Globe size={10} className="mr-1.5 text-slate-400" />
                           <span className="font-mono">{route.host}</span>
                        </div>
                      )}
                      <KeyValueDisplay icon={ListFilter} data={route.headers} />
                      <KeyValueDisplay icon={Search} data={route.query_params} />
                    </div>
                  </div>
                </td>

                {/* Upstreams & Load Balancer */}
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2 max-w-[250px]">
                    {hasLb && (
                      <div className="flex items-center text-[10px] text-slate-500 bg-slate-100/50 w-fit px-2 py-0.5 rounded-full border border-slate-200 mb-1">
                        <Network size={10} className="mr-1.5 text-slate-400" />
                        <span className="font-medium">LB: {route.lb?.strategy}</span>
                      </div>
                    )}
                    <div className="flex flex-col space-y-1">
                      {route.lb?.targets?.slice(0, upstreamLimit).map((up, i) => {
                        const status = route.lb && route.lb.state && route.lb.state[up].healthy;
                        const isUp = status;
                        return (
                          <div key={i} className="flex items-center text-sm text-slate-600 font-mono group/item" title={`${up} (${isUp ? 'Healthy' : 'Unhealthy'})`}>
                            {isUp ? (
                              <CheckCircle2 size={12} className="mr-2 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle size={12} className="mr-2 text-rose-500 shrink-0" />
                            )}
                            <span className={`truncate ${!isUp ? 'text-slate-400 decoration-slate-300' : ''}`}>{up}</span>
                          </div>
                        );
                      })}
                      {extraUpstreams > 0 && (
                        <div className="flex items-center pl-5 pt-1">
                          <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            +{extraUpstreams} more targets
                          </span>
                        </div>
                      )}
                      {(!route.upstreams || route.upstreams.length === 0) && (
                        <span className="text-xs text-rose-400 italic">No upstreams defined</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Policies (Auth, Filters) */}
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2 max-w-[200px]">
                    {/* Auth Strategy */}
                    {route.auth?.type ? (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded bg-slate-100 text-slate-500">
                          <ShieldCheck size={14} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Auth</span>
                           <span className="text-xs text-slate-500 capitalize">{route.auth.type}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50 mb-1">
                         <span className="text-xs text-slate-400">Public API</span>
                      </div>
                    )}

                    {/* Filter List */}
                    <div className="flex flex-wrap gap-1.5">
                      {route.filters?.slice(0, filterLimit).map((f, i) => (
                        <FilterBadge key={i} name={f.name} />
                      ))}
                      {extraFilters > 0 && (
                         <div className={`flex items-center justify-center h-[26px] px-1.5 rounded border text-[10px] font-medium ${filterBadgeClass}`} title={isFilterWarning ? "Policies require attention" : "All policies configured"}>
                            {isFilterWarning ? (
                              <AlertTriangle size={12} className={`mr-1 ${filterIconClass}`} />
                            ) : (
                              <CheckCircle2 size={12} className={`mr-1 ${filterIconClass}`} />
                            )}
                            +{extraFilters}
                         </div>
                      )}
                      {/* Show status icon even if filters visible, if the warning is present */}
                      {extraFilters === 0 && route.filters?.length!! > 0 && isFilterWarning && (
                        <div className={`flex items-center justify-center h-[26px] px-1.5 rounded border text-[10px] font-medium bg-amber-50 border-amber-200 text-amber-700`} title="Policies require attention">
                           <AlertTriangle size={12} className={`mr-1 text-amber-500`} />
                           Warning
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-2 py-4 text-right align-top">
                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full text-slate-400 hover:text-indigo-600" onClick={() => onDuplicate && onDuplicate(route)} title="Duplicate Route">
                      <Copy size={15} />
                    </Button>
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full text-slate-400 hover:text-slate-900" onClick={() => onEdit && onEdit(route)} title="Edit Configuration">
                      <Edit2 size={15} />
                    </Button>
                    <Button variant="ghost" className="w-8 h-8 px-0 rounded-full text-rose-300 hover:text-rose-600 hover:bg-rose-50" onClick={() => onDelete && onDelete(route.id)} title="Delete Route">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      {routes && routes.length === 0 && (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Waypoints size={32} className="text-slate-300" />
          </div>
          <h3 className="text-900 font-medium mb-1">No routes configured</h3>
          <p className="text-slate-500 text-sm">Get started by creating your first upstream proxy.</p>
        </div>
      )}
    </Card>
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
  </div>


)};

// Mock Data for the Example
const MOCK_ROUTES = [
  {
    id: "route_8f92k2",
    name: "Payment Service API",
    path_prefix: "/api/v1/payments",
    methods: ["POST", "PUT"],
    headers: { "X-Api-Version": "2.0" },
    query_params: {},
    host: "api.payments.internal",
    upstreams: ["http://payment-v1:8080", "http://payment-v2:8080"],
    enabled: true,
    auth: { type: "mtls" },
    filters: [{ name: "rate_limit" }],
    lb: { strategy: "least_conn" }
  },
  {
    id: "route_9g33j1",
    name: "Legacy User Data",
    path_prefix: "/users",
    methods: ["GET"],
    headers: {},
    query_params: { "region": "us-east" },
    host: "",
    upstreams: ["http://legacy-users:3000"],
    enabled: false,
    auth: { type: "basic" },
    filters: [{ name: "validate_schema" }, { name: "oauth2_client_credentials" }], // Added second filter here
    lb: { strategy: "round_robin" }
  },
  {
    id: "route_ha_9921",
    name: "Global CDN Edge",
    path_prefix: "/cdn/assets",
    methods: ["GET", "HEAD", "OPTIONS"],
    headers: { "Cache-Control": "no-cache" },
    query_params: { "v": "latest" },
    host: "cdn.internal.io",
    upstreams: [
      "http://us-east-1.cdn:80",
      "http://us-west-1.cdn:80",
      "http://eu-central-1.cdn:80",
      "http://ap-south-1.cdn:80",
      "http://sa-east-1.cdn:80"
    ],
    enabled: true,
    auth: { type: "none" },
    filters: [
      { name: "cors" },
      { name: "gzip" },
      { name: "request_id" },
      { name: "ip_restriction" },
      { name: "cache_control" }
    ],
    lb: { strategy: "geo_ip" }
  }
];


export default RoutesView;