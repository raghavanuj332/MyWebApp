import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, getDocs, orderBy, where, addDoc, serverTimestamp, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { formatSafeDate } from '../lib/utils';
import { Loader2, CheckSquare, Filter, Plus, Calendar, Flag, User, Clock, X, AlertCircle, Trash2, CheckCircle } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { role, user, auth } = useAuth() as any; 

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    projectId: '',
    dueDate: '',
    assigneeId: '',
  });

  const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [projectSnap, userSnap, taskSnap] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'tasks'))
      ]);

      const projectList = projectSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectList);

      const userList = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);

      let allTasks = taskSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Sort in memory to avoid index requirements
      allTasks.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toDate === 'function') return val.toDate().getTime();
          const d = new Date(val);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      if (filter === 'All') {
        setTasks(allTasks);
      } else {
        setTasks(allTasks.filter(t => t.status === filter));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Strategic connection failure. Data sync interrupted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tasks.length > 0);
  }, [filter]);

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Recycle this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await updateDoc(doc(db, 'tasks', id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.projectId) {
      setError('Please select a project');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        projectId: newTask.projectId,
        dueDate: newTask.dueDate,
        status: 'Pending',
        assigneeId: newTask.assigneeId || user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      setTasks([{ id: docRef.id, ...taskData, createdAt: new Date() }, ...tasks]);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', projectId: '', dueDate: '', assigneeId: '' });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors = {
    'Pending': 'bg-amber-500/10 text-amber-400',
    'In Progress': 'bg-indigo-500/10 text-indigo-400',
    'Completed': 'bg-emerald-500/10 text-emerald-400',
    'Overdue': 'bg-rose-500/10 text-rose-400',
  };

  const priorityIcons = {
    'High': { color: 'text-rose-400', bg: 'bg-rose-500/10' },
    'Medium': { color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'Low': { color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  };

  if (loading && tasks.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin opacity-50" />
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-white font-display uppercase italic">Task Central</h1>
           <p className="text-slate-400 mt-2 font-medium">Track individual contributions and upcoming deadlines.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-dark-panel border border-white/5 p-1.5 rounded-2xl shadow-inner">
              {['All', 'In Progress', 'Pending', 'Completed'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
           <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-3">
              <Plus size={18} /> Deploy Task
           </button>
           <button className="bg-white/5 text-white p-3.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <Filter size={20} />
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
                <h2 className="text-3xl font-black text-white font-display italic uppercase tracking-wider">Initialize Task</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold font-display uppercase italic">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Task Title</label>
                  <input 
                    required
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="E.g. Neural Link Optimization"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-bold italic tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-black italic tracking-widest text-[10px]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Assigned Project</label>
                    <select 
                      required
                      value={newTask.projectId}
                      onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-black italic tracking-widest text-[10px]"
                    >
                      <option value="">Select Protocol</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Assignee Specialist</label>
                  <select 
                    value={newTask.assigneeId}
                    onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-black italic tracking-widest text-[10px]"
                  >
                    <option value="">Self-Assign (Default)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 italic">Due Date</label>
                  <input 
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-bold tracking-widest uppercase text-xs"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Syncing...' : 'Confirm Deployment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-between gap-4 text-rose-400 font-bold uppercase italic text-xs tracking-widest animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
          <button onClick={() => fetchData()} className="bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-xl transition-all">Retry Sync</button>
        </div>
      )}

      <div className="bg-dark-panel/40 backdrop-blur-xl border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Task Dynamics</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Flow</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Timeline</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Criticality</th>
                <th className="p-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Operator</th>
                <th className="p-10"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <motion.tr 
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-all cursor-pointer relative"
                >
                  <td className="p-10 relative">
                     {/* Subtle hover row accent moved inside td */}
                     <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-500 border border-white/[0.03]">
                           <CheckSquare size={24} />
                        </div>
                        <div>
                           <div className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-[0.05em] text-base font-display italic">{task.title}</div>
                           <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">NXS-VLT-{i+102}</div>
                        </div>
                     </div>
                  </td>
                  <td className="p-10">
                     <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColors[task.status as keyof typeof statusColors]}`}>
                        {task.status}
                     </span>
                  </td>
                  <td className="p-10">
                     <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <Calendar size={14} className="text-slate-600" />
                        {task.dueDate ? formatSafeDate(task.dueDate) : 'Indefinite'}
                     </div>
                  </td>
                  <td className="p-10">
                     <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${task.priority === 'High' ? 'bg-rose-500 shadow-rose-500/40' : task.priority === 'Medium' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-indigo-500 shadow-indigo-500/40'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">{task.priority}</span>
                     </div>
                  </td>
                  <td className="p-10">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border-2 border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                           <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeId || 'default'}`} 
                            alt="avatar" 
                            className="w-full h-full"
                            referrerPolicy="no-referrer"
                           />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-white font-bold text-[11px] uppercase tracking-wider font-display">
                              {users.find(u => u.id === task.assigneeId)?.name || 'Nexus Agent'}
                           </span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 hidden sm:block">Specialist Unit</span>
                        </div>
                     </div>
                  </td>
                  <td className="p-10 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleStatusChange(task.id, task.status)}
                          title={task.status === 'Completed' ? 'Pending' : 'Complete'}
                          className={`p-2 rounded-xl transition-all ${
                            task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                           <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          title="Recycle Task"
                          className="p-2 bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                           <Trash2 size={18} />
                        </button>
                      </div>
                   </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="p-32 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-sm animate-pulse italic">
              All Dynamics Cleared.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
