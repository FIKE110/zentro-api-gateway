import { ScrollText } from "lucide-react";
import { Card } from "../components/ui";
import fetchTrafficLogs, { type LogEntry } from "../services/trafficlog";
import { useQuery } from "@tanstack/react-query";


function formatLogTime(t: string) {
  return new Date(t).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TrafficLogsView(){
      const { data, isLoading, isError } = useQuery<LogEntry[]>({
  queryKey: ["trafficlogs"],
  queryFn: fetchTrafficLogs,
  refetchInterval:2000
});

    return (
        <Card>
                 <div className="p-6 border-b border-slate-100"><h2 className="font-bold text-slate-900 flex items-center"><ScrollText size={18} className="mr-2 text-slate-400" /> Recent Traffic Logs</h2></div>
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                       <tr><th className="px-6 py-4">Time</th><th className="px-6 py-4">Method</th><th className="px-6 py-4">Path</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Latency</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {data && data.reverse().map((log,i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{formatLogTime(log.time)}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.method === 'GET' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{log.method}</span></td>
                            <td className="px-6 py-4 text-slate-700 font-medium">{log.path}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${log.statusCode === 200 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{log.statusCode}</span></td>
                            <td className="px-6 py-4 font-mono text-xs">{log.latency}ms</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </Card>
    )
}