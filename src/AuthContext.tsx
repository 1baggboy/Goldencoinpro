import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

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
        // Listen to profile changes
        const profileRef = doc(db, "users", firebaseUser.uid);
        console.log("Fetching profile for:", firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            console.log("Profile found:", docSnap.data());
            setProfile(docSnap.data() as UserProfile);
          } else {
            console.log("Profile not found for uid:", firebaseUser.uid);
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile snapshot error for", firebaseUser.uid, ":", error.message, error.code, error);
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

  const isAdmin = profile?.role === "admin" || user?.email === "lookuptoadams@gmail.com";
  const isRestricted = profile?.status === "restricted";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isRestricted }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
