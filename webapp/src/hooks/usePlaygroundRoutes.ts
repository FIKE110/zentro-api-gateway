import { useQuery } from '@tanstack/react-query';
import { fetchAllRoutes, type Route } from '../services/routes';
import { createApi } from '../services/api';
import { useAuthStore } from '../store/authstore';

const fetchPlaygroundRoutes = async (): Promise<Route[]> => {
  const token=useAuthStore.getState().token
  console.log(token)
  return createApi('/api/playground/routes',{
    headers:{
      'Authorization':`Bearer ${token}`
    }
  })
};

export const usePlaygroundRoutes = () => {
  return useQuery({
    queryKey: ['playgroundRoutes'],
    queryFn: fetchPlaygroundRoutes
  });
};
