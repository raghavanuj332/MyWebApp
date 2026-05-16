import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  role: 'Admin' | 'Member' | null;
  userName: string | null;
  loading: boolean;
  signIn: (name: string, role: 'Admin' | 'Member') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string, bio?: string, skills?: string[] }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Admin' | 'Member' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state change detected. User:', firebaseUser?.email);
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Profile found in Firestore for UID:', firebaseUser.uid, 'Name:', data.name);
            setRole(data.role);
            setUserName(data.name || firebaseUser.displayName || 'Nexus Operator');
          } else {
            console.log('No profile found in Firestore for UID:', firebaseUser.uid, 'Falling back to Google name.');
            setUserName(firebaseUser.displayName || 'Nexus Operator');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserName(firebaseUser.displayName || 'Nexus Operator');
        }
      } else {
        setRole(null);
        setUserName(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (name: string, selectedRole: 'Admin' | 'Member') => {
    const { signInWithPopup } = await import('firebase/auth');
    const { googleProvider } = await import('./firebase');
    
    // Force prompt to select account to avoid sticky sessions if they log out and log in again
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    
    console.log('SignIn process initiated. Selected Role:', selectedRole);
    const result = await signInWithPopup(auth, googleProvider);
    console.log('SignIn success. Google User:', result.user.email, 'DisplayName:', result.user.displayName);
    
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    const existingData = userDocSnapshot.data();

    // Priority: Input > Firestore > Google > Fallback
    const nameToUse = name.trim() || existingData?.name || result.user.displayName || 'Nexus Operator';
    console.log('Determinining display name. Preferred:', nameToUse);
    
    const userData = {
      name: nameToUse,
      role: selectedRole,
      email: result.user.email,
      bio: existingData?.bio || 'Focused on building high-performance digital ecosystems that bridge the gap between complex logic and minimalist design.',
      skills: existingData?.skills || ['Product Design', 'System Architecture', 'Frontend Engineering', 'Full-Stack Logic'],
      updatedAt: new Date().toISOString()
    };

    if (!userDocSnapshot.exists()) {
      await setDoc(userDocRef, { ...userData, createdAt: new Date().toISOString() });
    } else {
      await setDoc(userDocRef, userData, { merge: true });
    }
    
    console.log('Login verified for CID:', result.user.uid, 'Assigned Name:', nameToUse);
    setUser(result.user);
    setRole(selectedRole);
    setUserName(nameToUse);
  };

  const updateProfile = async (data: { name?: string, bio?: string, skills?: string[] }) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    if (data.name) setUserName(data.name);
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, userName, loading, signIn, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
