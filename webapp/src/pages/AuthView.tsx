import { AlertCircle, Lock, ShieldCheck, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui";
import { useAuthStore } from "../store/authstore";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthLogin from "../services/auth";


const AuthView = () => {
  const {user,setUser,setToken,token}=useAuthStore()
  const [isLogin, setIsLogin] = useState(user==null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate=useNavigate()
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

   const mutate=useMutation({
    mutationFn:AuthLogin,
    mutationKey:['loginmut'],
    onSuccess:(data)=>{
        setUser(username)
        setToken(data.token)
        navigate({pathname:"/dashboard"})
    },

    onError:(err)=>{
        setError(err.message || "Something went wrong");
    }
  })

  useEffect(()=>{
    if(!isLogin){
    navigate({pathname:"/dashboard"})
  }
  })


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      mutate.mutate(JSON.stringify({
        username,
        password
      })    )
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-900/20 text-white">Z</div>
             <span className="text-xl font-bold tracking-tight">Zentor</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Secure, Scalable <br/> API Management.
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Control traffic, manage consumers, and monitor your microservices architecture with a developer-first gateway.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="mb-3 text-emerald-400" size={24} />
              <h3 className="font-bold text-sm mb-1">Enterprise Security</h3>
              <p className="text-xs text-slate-400">JWT, API Keys, and ACLs built-in.</p>
           </div>
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <Zap className="mb-3 text-amber-400" size={24} />
              <h3 className="font-bold text-sm mb-1">Low Latency</h3>
              <p className="text-xs text-slate-400">Engineered for high-throughput routing.</p>
           </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 mt-12">
           © 2024 Zentor Inc. All rights reserved.
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
         <div className="w-full max-w-sm space-y-8">
            <div className="text-center lg:text-left">
               <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                 {isLogin ? 'Welcome back' : 'Create an account'}
               </h2>
               <p className="text-slate-500 text-sm">
                 {isLogin ? 'Enter your username to access the dashboard.' : 'Get started with your first gateway instance.'}
               </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100 flex items-center">
                <AlertCircle size={16} className="mr-2" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                 <div className="relative">
                   <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-slate-700 placeholder:text-slate-400"
                     placeholder="admin"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                 <div className="relative">
                   <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="password"
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-slate-700 placeholder:text-slate-400"
                     placeholder="••••••••"
                   />
                 </div>
                 {/* {isLogin && <div className="text-right"><a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a></div>} */}
               </div>

               <Button className="w-full h-11" disabled={loading}>
                 {loading ? <span className="animate-spin mr-2">⏳</span> : null}
                 {isLogin ? 'Sign In' : 'Create Account'}
               </Button>
            </form>

            {/* <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400">Or continue with</span></div>
            </div> */}

            {/* <div className="text-center text-sm">
               <span className="text-slate-500">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(null); }}
                 className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
               >
                 {isLogin ? 'Sign up' : 'Log in'}
               </button>
            </div> */}
         </div>
      </div>
    </div>
  );
};



export default AuthView