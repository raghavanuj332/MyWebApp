import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { Briefcase, Filter, LayoutGrid, List, MoreVertical, Plus, ChevronRight, X, AlertCircle } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'Active',
    progress: 0,
  });

  const { role, user } = useAuth();

  const fetchProjects = async () => {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory
      list.sort((a: any, b: any) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          const d = new Date(val);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      
      setProjects(list);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const projectData = {
        ...newProject,
        progress: Number(newProject.progress),
        ownerId: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      setProjects([{ id: docRef.id, ...projectData, createdAt: new Date() }, ...projects]);
      setShowModal(false);
      setNewProject({ name: '', description: '', status: 'Active', progress: 0 });
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Identity authorization failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Decommission this matrix logic?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    try {
      await updateDoc(doc(db, 'projects', id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      setProjects(projects.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-white font-display uppercase italic text-glow">Project Matrices</h1>
            <p className="text-slate-400 mt-2 font-medium">Manage core initiatives and structural expansion.</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex bg-dark-panel border border-white/5 p-1.5 rounded-2xl shadow-inner">
               <button 
                 onClick={() => setView('grid')}
                 className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <LayoutGrid size={18} />
               </button>
               <button 
                 onClick={() => setView('list')}
                 className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <List size={18} />
               </button>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-white text-dark-base px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all shadow-xl active:scale-95 flex items-center gap-3">
               <Plus size={18} /> Initiate Matrix
            </button>
         </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-dark-base/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-dark-panel border border-white/10 p-10 rounded-[3rem] w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider text-glow">Initialize Matrix</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold font-display uppercase italic">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Matrix Name</label>
                  <input 
                    required
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g. Project Orion"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-bold italic tracking-wider"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Architecture Overview</label>
                  <textarea 
                    required
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe the structural goals..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-medium h-32 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Status</label>
                    <select 
                      value={newProject.status}
                      onChange={e => setNewProject({...newProject, status: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-black italic tracking-widest text-[10px]"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Progress %</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={newProject.progress}
                      onChange={e => setNewProject({...newProject, progress: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-bold uppercase text-xs"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : 'Establish Matrix'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
        {projects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`group bg-dark-card border border-white/5 shadow-2xl hover:border-indigo-500/20 transition-all relative overflow-hidden ${
              view === 'grid' ? 'p-10 rounded-[3rem] h-full flex flex-col' : 'p-8 rounded-[2rem] flex items-center justify-between'
            }`}
          >
            <div className={view === 'grid' ? "" : "flex items-center gap-10 flex-1"}>
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500 shadow-inner">
                  <Briefcase size={32} />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStatusToggle(project.id, project.status)}
                    className="p-2 text-slate-700 hover:text-emerald-400 transition-colors"
                  >
                    <ChevronRight size={20} className={project.status === 'Completed' ? 'rotate-90' : ''} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 text-slate-700 hover:text-rose-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                   <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate font-display">{project.name}</h3>
                   <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                     project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                   }`}>
                     {project.status}
                   </span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-10 leading-relaxed font-medium">{project.description}</p>
              </div>
            </div>

            <div className={view === 'grid' ? "mt-auto space-y-8" : "flex items-center gap-16 min-w-[300px]"}>
               <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                     <span className="text-slate-600">Velocity</span>
                     <span className="text-indigo-400">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                     {[1, 2].map((u) => (
                       <img 
                        key={u} 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${u + i}`} 
                        alt="member" 
                        className="w-10 h-10 rounded-full border-4 border-dark-card bg-slate-200"
                        referrerPolicy="no-referrer"
                       />
                     ))}
                     <div className="w-10 h-10 rounded-full border-4 border-dark-card bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                        +3
                     </div>
                  </div>
                  <button className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group-hover:gap-5">
                    Terminal <Plus size={14} />
                  </button>
               </div>
            </div>
            
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
