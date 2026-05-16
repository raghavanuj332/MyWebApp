import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { seedMockData } from '../services/mockData';
import { formatSafeDate } from '../lib/utils';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, Plus, Search, Calendar, ChevronRight, Loader2, RefreshCcw } from 'lucide-react';

export default function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ totalTasks: 0, activeProjects: 0, completedTasks: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      setError(null);
      try {
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        const projectsSnap = await getDocs(collection(db, 'projects'));
        
        if (tasksSnap.empty && projectsSnap.empty) {
           const seeded = await seedMockData();
           if (!seeded) {
             console.error('Dashboard: seedMockData reported a failure — Firestore batch commit did not complete.');
             setError('Data initialization failed. Firestore may be unreachable or misconfigured.');
             return;
           }
           // Re-fetch after seed
           const newTasksSnap = await getDocs(collection(db, 'tasks'));
           const newProjectsSnap = await getDocs(collection(db, 'projects'));
           processData(newTasksSnap, newProjectsSnap);
        } else {
           processData(tasksSnap, projectsSnap);
        }
      } catch (err) {
        console.error('Dashboard: fetchData encountered an error:', err);
        setError('Failed to load dashboard data. Check your connection and Firestore permissions.');
      } finally {
        setLoading(false);
      }
    };

    const processData = (tasksSnap: any, projectsSnap: any) => {
      const allTasksDocs = tasksSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      
      setStats({
        totalTasks: allTasksDocs.length,
        activeProjects: projectsSnap.docs.filter((doc: any) => doc.data().status === 'Active').length,
        completedTasks: allTasksDocs.filter((t: any) => t.status === 'Completed').length,
        overdue: allTasksDocs.filter((t: any) => t.status === 'Overdue').length,
      });
      
      // Sort in memory and take top 5
      const sorted = [...allTasksDocs].sort((a: any, b: any) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          const d = new Date(val);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      setRecentTasks(sorted.slice(0, 5));
    };

    fetchData();
  }, [retryKey]);

  const statCards = [
    { label: 'Active Projects', value: stats.activeProjects, icon: PlayCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Task Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin opacity-50" />
    </div>
  );

  if (error) return (
    <div className="h-96 flex items-center justify-center p-6">
      <div className="bg-dark-panel border border-rose-500/20 p-12 rounded-[3.5rem] max-w-xl w-full text-center space-y-8 shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider">Sync Failure</h2>
          <p className="text-slate-400 font-medium leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => setRetryKey(k => k + 1)}
          className="bg-indigo-600 text-white w-full py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCcw size={16} /> Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold tracking-tight text-white font-display">System Dashboard</h1>
           <p className="text-slate-400 mt-1">Real-time overview of your workspace velocity.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Query system..." 
                className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-sm w-72 text-white"
              />
           </div>
           {role === 'Admin' && (
             <button className="bg-indigo-600 text-white rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
               <Plus size={18} /> Project
             </button>
           )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-dark-card p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group"
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
               <card.icon size={24} />
            </div>
            <div className="text-5xl font-black tracking-tighter text-white mb-2 font-display">{card.value}</div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.label}</div>
            
            {/* Visual glow on hover */}
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors duration-500" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Recent Tasks List */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-bold tracking-tight text-white">Active Operations</h2>
               <button className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Manifest All</button>
            </div>
            <div className="bg-dark-panel rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
               {recentTasks.map((task, i) => (
                 <div key={task.id} className={`flex items-center justify-between p-8 ${i !== recentTasks.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.02] transition-colors group cursor-pointer`}>
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {task.status === 'Completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                       </div>
                       <div>
                          <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{task.title}</div>
                          <div className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-3 uppercase tracking-widest">
                             <Calendar size={12} className="text-slate-600" /> {formatSafeDate(task.createdAt)}
                             <span className="w-1 h-1 bg-white/10 rounded-full" />
                             <span className={`px-2 py-0.5 rounded-md ${
                               task.priority === 'High' ? 'bg-rose-500/10 text-rose-400' : 
                               task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                             }`}>
                               {task.priority}
                             </span>
                          </div>
                       </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                 </div>
               ))}
            </div>
         </div>

         {/* Integrations Column */}
         <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-white px-2">Connected Sync</h2>
            <div className="space-y-4">
               <div className="bg-gradient-to-br from-indigo-900 to-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden group">
                  <div className="relative z-10">
                     <PlayCircle className="mb-6 opacity-40" size={40} />
                     <h3 className="text-xl font-bold mb-3 tracking-tight">Nexus Ecosystem</h3>
                     <p className="text-indigo-100 text-sm leading-relaxed mb-8 opacity-80">Synchronizing team calendar and shared documentation manifests across all tactical units.</p>
                     <button className="bg-white text-indigo-900 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95">Enabled</button>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                     <Search size={200} />
                  </div>
               </div>

               <div className="bg-dark-card border border-white/5 p-10 rounded-[3rem] shadow-2xl group flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#4A154B] text-white rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-xl shadow-purple-900/20">
                     <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Slack Pulse</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">Instant relay for project milestones and user-assigned directives.</p>
                  <button className="text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all">
                     Configure Webhooks <ChevronRight size={16} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
