import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { APP_CONFIG } from "./config";
import { generateReferralCode } from "./lib/utils";

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
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        console.log("User authenticated:", firebaseUser.uid, firebaseUser.email, "isAnonymous:", firebaseUser.isAnonymous);
        
        // Refresh token in background without blocking
        if (!firebaseUser.isAnonymous) {
          firebaseUser.getIdToken(true).then(() => {
            console.log("Token refreshed successfully");
          }).catch(e => {
            if (e.code === 'auth/network-request-failed') {
              console.warn("Token refresh failed due to network. This is expected if connectivity is spotty.");
            } else {
              console.error("Failed to refresh token:", e);
            }
          });
        }
        
        // Listen to profile changes for non-anonymous users
        if (firebaseUser.isAnonymous) {
          console.log("User is anonymous, skipping profile fetch");
          setProfile(null);
          setLoading(false);
          return;
        }

        const profileRef = doc(db, "users", firebaseUser.uid);
        console.log("Attaching onSnapshot for:", firebaseUser.uid);
        
        let retryCount = 0;
        const maxRetries = 3;
        
        const startSnapshot = (isRetry = false) => {
          const unsub = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              console.log("Profile snapshot received:", docSnap.data());
              const data = docSnap.data() as UserProfile;
              
              // Fix missing referral code immediately
              if (!data.referralCode) {
                const newCode = generateReferralCode();
                console.log("Generating missing referral code for user:", firebaseUser.uid, newCode);
                updateDoc(profileRef, { referralCode: newCode }).catch(err => {
                  console.error("Failed to update missing referral code:", err);
                });
                // Update local state temporarily to avoid flicker if possible
                setProfile({ ...data, referralCode: newCode });
              } else {
                setProfile(data);
              }
            } else {
              console.log("Profile snapshot: document does not exist for", firebaseUser.uid);
              setProfile(null);
            }
            setLoading(false);
          }, (error) => {
            if (error.code === 'permission-denied' && retryCount < maxRetries) {
              retryCount++;
              console.warn(`Profile snapshot permission denied for ${firebaseUser.uid}, retrying in 2s... (Attempt ${retryCount}/${maxRetries})`);
              setTimeout(() => {
                if (unsubProfile) {
                  unsubProfile();
                }
                unsubProfile = startSnapshot(true);
              }, 2000);
            } else {
              console.error("Profile snapshot error for", firebaseUser.uid, ":", error.message, error.code);
              setLoading(false);
            }
          });
          return unsub;
        };

        unsubProfile = startSnapshot();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
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
