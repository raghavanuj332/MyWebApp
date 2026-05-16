import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { Users, Mail, Phone, MapPin, ExternalLink, MessageSquare, ChevronRight, Plus, X, AlertCircle } from 'lucide-react';

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { role, user } = useAuth();

  const fetchTeams = async () => {
    try {
      const snap = await getDocs(collection(db, 'teams'));
      setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const teamData = {
        ...newTeam,
        memberIds: [user?.uid],
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'teams'), teamData);
      setTeams([{ id: docRef.id, ...teamData }, ...teams]);
      setShowModal(false);
      setNewTeam({ name: '', description: '' });
    } catch (err: any) {
      setError(err.message || 'System uplink failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Delete this tactical unit?')) return;
    try {
      await deleteDoc(doc(db, 'teams', id));
      setTeams(teams.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black tracking-tight text-white font-display uppercase italic text-glow">Unit Ecosystem</h1>
            <p className="text-slate-400 mt-2 font-medium">Explore specialized teams and their resource allocation.</p>
         </div>
         <button 
           onClick={() => setShowModal(true)}
           className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-3">
            <Plus size={18} /> Deploy Unit
         </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-dark-base/80 backdrop-blur-sm"
               onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-dark-panel border border-white/10 p-10 rounded-[3rem] w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider mb-8">Deploy Tactical Unit</h2>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Unit Identifier</label>
                    <input 
                      required
                      value={newTeam.name}
                      onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="e.g. Alpha Logic Team"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-bold italic tracking-wider"
                    />
                 </div>
                 <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
                 >
                   {isSubmitting ? 'Initializing...' : 'Deploy Unit'}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {teams.map((team, i) => (
          <motion.div 
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-dark-panel/40 backdrop-blur-xl border border-white/5 rounded-[4rem] p-12 hover:border-indigo-500/20 transition-all overflow-hidden relative group"
          >
            <div className="relative z-10">
               <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:rotate-12 transition-all duration-500 border border-white/[0.05] shadow-inner">
                        <Users size={32} />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black text-white font-display italic tracking-wide group-hover:text-indigo-400 transition-colors">{team.name}</h3>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Design & Logic Division</p>
                     </div>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                    Active
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                     <div className="text-4xl font-black text-white mb-2 font-display italic">{team.memberIds?.length || 0}</div>
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Core Operatives</div>
                  </div>
                  <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/[0.03] group-hover:bg-white/[0.04] transition-colors">
                     <div className="text-4xl font-black text-white mb-2 font-display italic">{team.projectIds?.length || 0}</div>
                     <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Matrix</div>
                  </div>
               </div>

               <div className="space-y-5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                    High Contribution
                    <div className="h-[1px] flex-1 bg-white/[0.05]" />
                  </div>
                  {[1, 2].map((m) => (
                    <div key={m} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.03] rounded-[2rem] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all cursor-pointer group/item">
                       <div className="flex items-center gap-5">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=member${m+i}`} alt="m" className="w-12 h-12 rounded-2xl border-2 border-white/5 bg-slate-800" referrerPolicy="no-referrer" />
                          <div>
                             <div className="text-[15px] font-black text-white uppercase tracking-wider font-display">Specialist {m}</div>
                             <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Tactical Division</div>
                          </div>
                       </div>
                       <div className="flex gap-3 opacity-20 group-hover/item:opacity-100 transition-opacity">
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors border border-white/[0.05]"><MessageSquare size={16} /></div>
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors border border-white/[0.05]"><Mail size={16} /></div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 flex items-center justify-between">
                  <button className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:gap-5 transition-all text-glow">
                     Access Database <ChevronRight size={18} />
                  </button>
                  <div className="flex gap-3">
                     <button 
                        onClick={() => handleDeleteTeam(team.id)}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all"
                     >
                        <X size={20} />
                     </button>
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-all transform hover:rotate-12"><ExternalLink size={20} /></div>
                  </div>
               </div>
            </div>

            {/* Background Kinetic Accents */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] group-hover:bg-indigo-600/10 transition-colors duration-1000" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] group-hover:bg-purple-600/10 transition-colors duration-1000" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
