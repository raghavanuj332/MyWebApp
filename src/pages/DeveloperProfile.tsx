import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, Globe, MapPin, Award, Star, Zap, Code2, Palette, Terminal, Edit3, X, Save, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';

export default function DeveloperProfile() {
  const { userName, role, user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    bio: 'Focused on building high-performance digital ecosystems that bridge the gap between complex logic and minimalist design.',
    skills: ['Product Design', 'System Architecture', 'Frontend Engineering', 'Full-Stack Logic'],
    name: userName || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            bio: data.bio || 'Focused on building high-performance digital ecosystems that bridge the gap between complex logic and minimalist design.',
            skills: data.skills || ['Product Design', 'System Architecture', 'Frontend Engineering', 'Full-Stack Logic'],
            name: data.name || userName || user.displayName || 'Nexus Operator'
          });
        } else {
          setProfileData(prev => ({ ...prev, name: userName || user.displayName || 'Nexus Operator' }));
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, userName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        skills: profileData.skills
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      // Construct a minimal errInfo for logging purposes if handleFirestoreError isn't used here
      alert('Failed to synchronize profile. Please check console for tactical details.');
    } finally {
      setIsSaving(false);
    }
  };

  const skillIcons: Record<string, any> = {
    'Product Design': Palette,
    'System Architecture': Code2,
    'Frontend Engineering': Terminal,
    'Full-Stack Logic': Zap,
    'Database Architecture': Globe,
    'Security Protocol': Award
  };

  const skillColors: Record<string, string> = {
    'Product Design': 'bg-rose-500/10 text-rose-400',
    'System Architecture': 'bg-indigo-500/10 text-indigo-400',
    'Frontend Engineering': 'bg-purple-500/10 text-purple-400',
    'Full-Stack Logic': 'bg-amber-500/10 text-amber-400',
  };

  const highlights = [
    { label: 'Cycle Experience', value: '5+ Years' },
    { label: 'Entities Deployed', value: '42' },
    { label: 'Logic Integrity', value: 'A+ Class' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-dark-base/80 backdrop-blur-sm"
               onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-dark-panel border border-white/10 p-10 rounded-[3rem] w-full max-w-xl relative shadow-2xl overflow-hidden text-slate-200"
            >
              <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider mb-8">Override Profile</h2>
              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Operator Nickname</label>
                    <input 
                      value={profileData.name}
                      onChange={e => setProfileData({...profileData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-bold italic tracking-wider"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Vision Protocol (Bio)</label>
                    <textarea 
                      value={profileData.bio}
                      onChange={e => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-medium h-32 resize-none"
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Tactical Stack (Skills)</label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Product Design', 'System Architecture', 'Frontend Engineering', 'Full-Stack Logic', 'Database Architecture', 'Security Protocol'].map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                               const newSkills = profileData.skills.includes(skill)
                                 ? profileData.skills.filter(s => s !== skill)
                                 : [...profileData.skills, skill];
                               setProfileData({...profileData, skills: newSkills});
                            }}
                            className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                               profileData.skills.includes(skill)
                               ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                               : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                            }`}
                          >
                             {skill}
                          </button>
                       ))}
                    </div>
                 </div>
                 <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
                 >
                   {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Hero */}
      <div className="relative">
        <div className="h-80 w-full bg-dark-panel rounded-[4rem] overflow-hidden border border-white/5 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-transparent to-purple-900/30" />
        </div>
        
        <div className="px-16 -mt-32 relative z-10 flex flex-col md:flex-row items-end gap-12">
           <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-56 h-56 rounded-[3.5rem] border-8 border-dark-base bg-dark-panel shadow-2xl overflow-hidden group relative"
           >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                alt={profileData.name || 'User'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 p-1"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-2 border-white/5 rounded-[3.5rem] pointer-events-none" />
           </motion.div>
           <div className="flex-1 pb-6">
              <h1 className="text-6xl font-black tracking-tighter text-white mb-4 font-display italic text-glow uppercase">{profileData.name || 'Nexus Operator'}</h1>
              <div className="flex flex-wrap items-center gap-5">
                 <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-5 py-2 rounded-2xl text-slate-300 text-xs font-black uppercase tracking-[0.2em] border border-white/5">
                    <MapPin size={16} className="text-indigo-400" /> Remote Base
                 </div>
                 <div className="flex items-center gap-3 bg-indigo-600 px-5 py-2 rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                    <Star size={16} /> {role || 'Member'}
                 </div>
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-2 rounded-2xl text-slate-300 text-xs font-black uppercase tracking-[0.2em] border border-white/5 transition-all"
                 >
                    <Edit3 size={16} className="text-indigo-400" /> Override Data
                 </button>
              </div>
           </div>
           <div className="flex gap-4 pb-6">
              <button className="p-4 bg-white/5 border border-white/5 rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 hover:-translate-y-2 transition-all duration-500"><Linkedin size={24} /></button>
              <button className="p-4 bg-white/5 border border-white/5 rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 hover:-translate-y-2 transition-all duration-500"><Github size={24} /></button>
              <button className="p-4 bg-white/5 border border-white/5 rounded-3xl text-slate-400 hover:text-white hover:bg-white/10 hover:-translate-y-2 transition-all duration-500"><Mail size={24} /></button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16 px-4">
         {/* About & Stack */}
         <div className="lg:col-span-2 space-y-16">
            <section className="space-y-8">
               <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-5 font-display italic uppercase">
                  <span className="w-12 h-[2px] bg-indigo-600 rounded-full" />
                  Vision Protocol
               </h2>
               <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  {profileData.bio}
               </p>
            </section>

            <section className="space-y-8">
               <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-5 font-display italic uppercase">
                  <span className="w-12 h-[2px] bg-indigo-600 rounded-full" />
                  Tactical Stack
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.skills.map((skillName) => {
                    const Icon = skillIcons[skillName] || Code2;
                    const color = skillColors[skillName] || 'bg-indigo-500/10 text-indigo-400';
                    return (
                      <div key={skillName} className="flex items-center gap-6 p-8 bg-dark-panel/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] hover:border-indigo-500/20 transition-all group overflow-hidden relative">
                         <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 border border-white/[0.05] shadow-inner`}>
                            <Icon size={28} />
                         </div>
                         <span className="font-black text-white text-[15px] uppercase tracking-widest font-display italic group-hover:text-indigo-400 transition-colors">{skillName}</span>
                         <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-white/[0.03] transition-colors" />
                      </div>
                    );
                  })}
               </div>
            </section>
         </div>

         {/* Sidebar stats */}
         <div className="space-y-10">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
               <Award className="absolute -top-16 -right-16 text-white/[0.02] group-hover:text-white/[0.05] transition-colors duration-700" size={280} />
               <h3 className="text-2xl font-black mb-10 relative z-10 font-display italic uppercase tracking-wider text-glow">Matrix Metrics</h3>
               <div className="space-y-10 relative z-10">
                  {highlights.map((h) => (
                    <div key={h.label} className="group/stat">
                       <div className="text-5xl font-black text-indigo-400 mb-2 font-display italic group-hover/stat:translate-x-2 transition-transform duration-500">{h.value}</div>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{h.label}</div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-12 bg-indigo-600 rounded-[3.5rem] space-y-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-white/20 transition-colors" />
               <h3 className="text-2xl font-black text-white relative z-10 font-display italic uppercase">Pulse Points</h3>
               <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Website</span>
                     <Globe size={20} className="text-white" />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Twitter</span>
                     <Twitter size={20} className="text-white" />
                  </div>
               </div>
               <button className="w-full bg-white text-indigo-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all shadow-2xl relative z-10">
                  Initialize Sync
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
