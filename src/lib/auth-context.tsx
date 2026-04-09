import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: (User & UserProfile) | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAdmin: () => Promise<{ success: boolean; email?: string; pass?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & UserProfile) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Create default profile for new user
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "Học sinh",
            role: "student",
            xp: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
          setUser({ ...firebaseUser, ...newProfile } as any);
        } else {
          // Update lastLogin
          await updateDoc(doc(db, "users", firebaseUser.uid), {
            lastLogin: new Date().toISOString()
          });

          // Listen for real-time updates to profile (XP, Streak)
          onSnapshot(doc(db, "users", firebaseUser.uid), (snapshot) => {
            if (snapshot.exists()) {
              setUser({ ...firebaseUser, ...snapshot.data() } as any);
            }
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: email,
      displayName: name,
      role: "student",
      xp: 0,
      streak: 0,
      lastActive: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", cred.user.uid), newProfile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const bootstrapAdmin = async () => {
    const adminEmail = "master@thptnguyenhue.edu.vn";
    const adminPass = "Master@123456";
    try {
      const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: adminEmail,
        displayName: "Master Admin",
        role: "admin",
        xp: 9999,
        streak: 999,
        lastActive: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
      return { success: true, email: adminEmail, pass: adminPass };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: "Tài khoản Master đã tồn tại. Vui lòng đăng nhập với: " + adminEmail };
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, register, logout, bootstrapAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
