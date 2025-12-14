import { useAuthStore } from "../store/authstore";
import { createApi } from "./api";

const API_BASE_URL = "";

export interface GlobalSettings {
  name: string;
  environment: string;
  port: number;
  admin_email: string;
  global_rate_limiting: number;
  cors: boolean;
}

export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
  const token=useAuthStore.getState().token
  return await createApi('/api/settings',{
    headers:{
      'Authorization':`Bearer ${token}`
    }
  })
};

export const updateGlobalSettings = async (settings: GlobalSettings): Promise<GlobalSettings> => {
  const token = useAuthStore.getState().token;
  return await createApi('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
};
