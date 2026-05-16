import React, { ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import DeveloperProfile from './pages/DeveloperProfile';

import { Loader2 } from 'lucide-react';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 overflow-hidden">
       <div className="relative">
          <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-x-0 -bottom-12 flex justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          </div>
       </div>
       <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] animate-pulse">Initializing Nexus Matrix</div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><DeveloperProfile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
