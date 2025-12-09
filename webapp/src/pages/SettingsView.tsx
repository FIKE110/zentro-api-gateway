import { useEffect, useState } from "react";
import { Button, Card, Input } from "../components/ui";
import { Cloud, Save, ShieldCheck } from "lucide-react";
import { fetchGlobalSettings, updateGlobalSettings, type GlobalSettings } from "../services/settings";

const SettingsView = () => {
  const [form, setForm] = useState<GlobalSettings>({
    name: "",
    environment: "",
    port: 0,
    admin_email: "",
    global_rate_limiting: 0,
    cors: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchGlobalSettings().then(data => {
      setForm(data);
      setInitialLoad(false);
    }).catch(error => {
      console.error("Failed to fetch global settings:", error);
      setInitialLoad(false);
      // Optionally, set default values or show an error message
    });
  }, []);

  const handleSave = () => {
    setLoading(true);
    updateGlobalSettings(form).then(() => {
      setLoading(false);
      alert("Settings saved successfully!"); // Simple success feedback
    }).catch(error => {
      console.error("Failed to update global settings:", error);
      setLoading(false);
      alert("Failed to save settings."); // Simple error feedback
    });
  };

  if (initialLoad) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage global gateway parameters.</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <span className="animate-spin mr-2">⏳</span> : <Save size={16} />}
          <span>Save Changes</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <Cloud size={18} className="mr-3 text-indigo-500"/> 
          <h3 className="font-semibold text-slate-900">General Information</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Gateway Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Environment</label>
            <select 
              value={form.environment}
              onChange={e => setForm({...form, environment: e.target.value})}
              className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-slate-700"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          <Input label="Port" type="number" value={form.port} onChange={e => setForm({...form, port: parseInt(e.target.value)})} />
          <Input label="Admin Email" type="email" value={form.admin_email} onChange={e => setForm({...form, admin_email: e.target.value})} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <ShieldCheck size={18} className="mr-3 text-emerald-500"/> 
          <h3 className="font-semibold text-slate-900">Security & Traffic</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between group">
             <div>
               <label className="block text-sm font-medium text-slate-900">Global Rate Limiting</label>
               <p className="text-xs text-slate-500 mt-0.5">Maximum requests per minute across all routes.</p>
             </div>
             <div className="w-32">
               <Input type="number" value={form.global_rate_limiting} onChange={e => setForm({...form, global_rate_limiting: parseInt(e.target.value)})} />
             </div>
          </div>
          <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
             <div>
               <label className="block text-sm font-medium text-slate-900">CORS Headers</label>
               <p className="text-xs text-slate-500 mt-0.5">Allow cross-origin requests from any domain.</p>
             </div>
             <button 
               onClick={() => setForm({...form, cors: !form.cors})}
               className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${form.cors ? 'bg-indigo-600' : 'bg-slate-200'}`}
             >
               <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.cors ? 'translate-x-6' : 'translate-x-1'}`}/>
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
};


export default SettingsView