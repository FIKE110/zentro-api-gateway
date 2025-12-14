import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type AuthState={
    user:any | null
    token:string | null
    setUser:(user:any)=>void
    setToken:(token:string | null)=>void
    logOut:()=>void
}


export const useAuthStore=create(persist<AuthState>((set)=>({
    user:null,
    token:null,
    setUser:(user:any)=>set(()=>({user:user})),
    setToken:(token:string | null)=>set(()=>({token:token})),
    logOut:()=>set(()=>({user:null,token:null}))
}),{name:'auth-store',storage:createJSONStorage(() => sessionStorage)}))