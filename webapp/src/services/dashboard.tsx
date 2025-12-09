import { createApi } from "./api";

type DataPoint = {
  time: string
  requestCount: number
}

type GatewayMetrics = {
  totalRequests: number
  averageLatency: number
  errorRate: number
  timeSeries: DataPoint[]
  timeSeries24:DataPoint[]
  uptime: number
}

type SystemStatus = {
  cpuUsagePercent: number
  memUsagePercent: number
  systemOnline: boolean
}

export type MetricsResponse = {
  activeRoutes: number
  gatewayMetrics: GatewayMetrics
  systemStatus: SystemStatus
}




export default async function fetchMetrics(): Promise<MetricsResponse> {
  return await createApi('/api/dashboard')
}