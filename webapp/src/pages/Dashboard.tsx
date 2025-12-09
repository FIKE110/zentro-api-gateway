import { useQuery } from '@tanstack/react-query';
import { BarChart3, Zap, AlertCircle, Waypoints, Gauge, Cpu, Server } from 'lucide-react';
import fetchMetrics from '../services/dashboard';
import { CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,LineChart } from 'recharts';
import prettyMilliseconds from 'pretty-ms';
import { useState } from 'react';

const Card = ({ children, className = "" }:{children:any,className:string}) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

export default function DashboardView () {

    const { data, isLoading, isError, refetch,status } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 2000, // Poll every 2 seconds
  })



  const [series,SetSeries]=useState(false) 


    return(
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Requests", value: data?.gatewayMetrics.totalRequests || 0, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Avg Latency", value: `${data?.gatewayMetrics.averageLatency || 0}ms`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Error Rate", value: `${data?.gatewayMetrics.errorRate.toFixed(2) || 0}%`, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
        { label: "Active Routes", value: data?.activeRoutes || 0, icon: Waypoints, color: "text-emerald-600", bg: "bg-emerald-50" }
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
            <button className={`px-3 py-1 text-xs font-medium ${!series ? 'bg-white text-slate-800 rounded-md shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} onClick={()=>SetSeries(false)}>1H</button>
            <button className={`px-3 py-1 text-xs font-medium ${series ? 'bg-white text-slate-800 rounded-md shadow-sm' : 'text-slate-500 hover:text-slate-900'}`} onClick={()=>SetSeries(true)}>24H</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={series? data?.gatewayMetrics.timeSeries24 : data?.gatewayMetrics.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
               <XAxis
  dataKey="time"
  tickFormatter={(t) => {
    const d = new Date(t);

    // if 24-hour series → show short date + hour
    if (series) {
      return d.toLocaleString([], {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // normal short chart (only minutes)
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }}
/>

<Tooltip
  labelFormatter={(t) =>
    series
      ? new Date(t).toLocaleString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
  }
/>
                <YAxis />
                <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString()} />
                <Line type="monotone" dataKey="requestCount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 flex flex-col">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
          <Gauge size={20} className="mr-2 text-slate-400" /> System Status
        </h2>
        <div className="space-y-8 flex-1">
          {[
            { label: "CPU Usage", value: data?.systemStatus.cpuUsagePercent.toFixed(2), icon: Cpu, color: "bg-indigo-500" },
            { label: "Memory", value: 30, icon: Server, color: "bg-emerald-500" }
          ].map((metric, i) => (
             <div key={i}>
              <div className="flex justify-between text-sm mb-2.5">
                <span className="text-slate-500 font-medium flex items-center">
                  <metric.icon size={14} className="mr-2 text-slate-400"/> {metric.label}
                </span>
                <span className="font-bold text-slate-700">{i === 1 ? `${data?.systemStatus.memUsagePercent.toFixed(2) || 0}MB` : `${metric.value || 0}%`}</span>
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
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status!='error' ?'bg-emerald-500' : 'bg-red-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${status!='error' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-emerald-900">{(status != 'error')
    ? 'Connected'
    : 'Disconnected'}</p>
                { data ?.gatewayMetrics.uptime && <p className="text-[10px] text-emerald-700/70">Uptime: {prettyMilliseconds(data?.gatewayMetrics.uptime/1e6,{secondsDecimalDigits:0})} </p>}
               </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
)};
