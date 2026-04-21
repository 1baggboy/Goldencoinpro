import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { APP_CONFIG } from "./config";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  usdBalance: number; // Main account balance in USD
  btcBalance: number; // BTC balance
  tradingBalanceBtc: number; // Trading balance in BTC
  totalDepositedUsd: number; // Total deposited in USD
  kycStatus: "not_submitted" | "pending" | "verified" | "rejected";
  kycRejectionReason?: string;
  createdAt: string;
  status: "active" | "restricted";
  twoFactorEnabled?: boolean;
  photoURL?: string;
  phoneNumber?: string;
  gender?: string;
  btcWalletAddress?: string;
  referralCode: string;
  referredBy?: string;
  referralBonusEarned: number;
  hasTraded?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isRestricted: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isRestricted: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        console.log("User authenticated:", firebaseUser.uid, firebaseUser.email);
        
        // Refresh token in background without blocking
        firebaseUser.getIdToken(true).then(() => {
          console.log("Token refreshed successfully");
        }).catch(e => {
          if (e.code === 'auth/network-request-failed') {
            console.warn("Token refresh failed due to network. This is expected if connectivity is spotty.");
          } else {
            console.error("Failed to refresh token:", e);
          }
        });
        
        // Listen to profile changes
        const profileRef = doc(db, "users", firebaseUser.uid);
        console.log("Attaching onSnapshot for:", firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            console.log("Profile snapshot received:", docSnap.data());
            setProfile(docSnap.data() as UserProfile);
          } else {
            console.log("Profile snapshot: document does not exist for", firebaseUser.uid);
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile snapshot error for", firebaseUser.uid, ":", error.message, error.code, error);
          // If permission denied, maybe retry once after a delay?
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === "admin" || (user?.email ? APP_CONFIG.adminEmails.includes(user.email) : false);
  const isRestricted = profile?.status === "restricted";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isRestricted }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
