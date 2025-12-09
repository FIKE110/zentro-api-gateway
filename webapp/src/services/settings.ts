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
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Assuming a JWT token is stored in localStorage after login
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};
