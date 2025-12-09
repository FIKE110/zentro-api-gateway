import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthView from './pages/AuthView.tsx'
import { useAuthStore } from './store/authstore.tsx'



const queryClient = new QueryClient()
const token=useAuthStore.getState().token

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <BrowserRouter>
       
        <App />
    </BrowserRouter>
    </QueryClientProvider>
   

  </StrictMode>,
)
