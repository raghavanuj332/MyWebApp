import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, CheckSquare, Users, User, LogOut, Menu, X, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/auth';
import DotsBackground from './DotsBackground';

export default function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { role, logout, userName, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-200 overflow-x-hidden bg-dark-base">
      {/* <DotsBackground /> */}
      
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-dark-panel border-r border-white/5 z-50 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex items-center justify-between p-6 h-20">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-white flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <Briefcase size={16} className="text-white" />
              </div>
              Nexus <span className="text-slate-500 font-light text-sm">Suite</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors ml-auto text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-3">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center p-3 rounded-xl transition-all group ${
                location.pathname === item.path 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <item.icon size={22} className={`${location.pathname === item.path ? 'text-indigo-400' : 'group-hover:text-indigo-400'} transition-colors`} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-medium text-sm"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
           {isSidebarOpen && (
             <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Sync Connected</div>
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      <MessageSquare size={14} className="text-white opacity-80" />
                   </div>
                   <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm cursor-pointer hover:scale-110 transition-transform">
                      <ExternalLink size={14} className="text-white" />
                   </div>
                </div>
             </div>
           )}
          <button 
            onClick={logout}
            className={`flex items-center w-full p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all group ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="ml-4 font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`transition-all duration-300 pt-20 px-10 pb-12 ${isSidebarOpen ? 'pl-72' : 'pl-32'}`}
      >
        <header className="fixed top-0 right-0 left-0 h-20 bg-dark-base/40 backdrop-blur-xl z-40 border-b border-white/5 flex items-center justify-between px-10 ml-20 transition-all duration-300" 
                style={{ marginLeft: isSidebarOpen ? '16rem' : '5rem' }}>
           <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Session Active</div>
              <div className="text-sm font-medium text-slate-300">
                <span className="text-white font-bold">{userName || 'Nexus Operator'}</span> 
                {user?.email && <span className="text-slate-500 text-[10px] ml-2 block sm:inline">({user.email})</span>}
                <span className="text-slate-500 italic mx-2 hidden sm:inline">|</span> 
                Identified as <span className="text-indigo-400 font-bold capitalize">{role}</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Sync Normal</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 overflow-hidden shadow-lg shadow-indigo-500/20">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                   alt="avatar" 
                   className="w-full h-full object-cover bg-slate-800"
                   referrerPolicy="no-referrer"
                 />
              </div>
           </div>
        </header>

        <div className="mt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
