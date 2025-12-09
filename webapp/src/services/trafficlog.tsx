import { createApi } from "./api";

export interface LogEntry {
  clientIp: string;
  latency: number;      // in nanoseconds
  method: string;
  path: string;
  statusCode: number;
  time: string;         // ISO timestamp
}

export default async function fetchTrafficLogs(): Promise<LogEntry[]> {
  return await createApi('/api/traffic-logs')
}