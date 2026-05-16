import { db } from '../lib/firebase';
import { doc, writeBatch, collection } from 'firebase/firestore';

export async function seedMockData(): Promise<boolean> {
  const batch = writeBatch(db);

  // Projects
  const projects = [
    { id: 'p1', name: 'Nexus Core', description: 'Main infrastructure project', status: 'Active', progress: 65 },
    { id: 'p2', name: 'Client Portal', description: 'External facing dashboard', status: 'Active', progress: 40 },
    { id: 'p3', name: 'Security Audit', description: 'Annual security review', status: 'On Hold', progress: 10 },
  ];

  projects.forEach(p => {
    const ref = doc(collection(db, 'projects'), p.id);
    batch.set(ref, { ...p, createdAt: new Date().toISOString() });
  });

  // Tasks
  const tasks = [
    { title: 'Update Login UI', status: 'In Progress', priority: 'High', projectId: 'p1', assigneeId: 'demo-user' },
    { title: 'Fix API Bug', status: 'Pending', priority: 'High', projectId: 'p1', assigneeId: 'demo-user' },
    { title: 'Write Documentation', status: 'Completed', priority: 'Medium', projectId: 'p2', assigneeId: 'demo-user' },
    { title: 'Prepare Presentation', status: 'Pending', priority: 'Low', projectId: 'p3', assigneeId: 'demo-user' },
  ];

  tasks.forEach((t, i) => {
    const ref = doc(collection(db, 'tasks'), `t${i}`);
    batch.set(ref, { ...t, createdAt: new Date().toISOString() });
  });

  // Teams
  const teams = [
    { name: 'Engineering', memberIds: ['u1', 'u2'], projectIds: ['p1', 'p2'] },
    { name: 'Design', memberIds: ['u3'], projectIds: ['p1'] },
  ];

  teams.forEach((tm, i) => {
    const ref = doc(collection(db, 'teams'), `tm${i}`);
    batch.set(ref, tm);
  });

  try {
    await batch.commit();
    return true;
  } catch (err) {
    console.error('seedMockData: Firestore batch commit failed:', err);
    return false;
  }
}
