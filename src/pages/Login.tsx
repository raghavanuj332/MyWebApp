import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../lib/auth';
import DotsBackground from '../components/DotsBackground';

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(name, role);
      navigate('/');
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen relative flex items-center justify-center p-6 bg-dark-base overflow-hidden">
      {/* <DotsBackground /> */}
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <div className="bg-dark-panel/60 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[3rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <Zap className="text-indigo-400/20" size={100} />
          </div>

          <div className="mb-12 relative">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Nexus <span className="text-indigo-500">Suite</span></h1>
            <p className="text-slate-400 font-medium">Enterprise Project Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Custom Display Name (Optional)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank to use Google name"
                  className="w-full bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Access Protocol</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                    role === 'Admin' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  <Shield size={18} />
                  <span className="font-bold text-sm">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Member')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                    role === 'Member' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  <User size={18} />
                  <span className="font-bold text-sm">Member</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-dark-base rounded-2xl py-5 font-bold flex items-center justify-center gap-3 transition-all hover:bg-indigo-50 active:scale-95 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-dark-base/20 border-t-dark-base rounded-full animate-spin" />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Nexus Suite v2.4.0 • Enterprise Edition</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
