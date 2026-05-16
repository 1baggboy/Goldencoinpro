import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  status: "active" | "restricted" | "suspended" | "inactive";
  isSuspended?: boolean;
  twoFactorEnabled?: boolean;
  photoURL?: string;
  phoneNumber?: string;
  gender?: string;
  btcWalletAddress?: string;
  referralCode: string;
  referredBy?: string;
  referralBonusEarned: number;
  hasTraded?: boolean;
  isOnline?: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isRestricted: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isRestricted: false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const logoutRef = useRef<(() => Promise<void>) | null>(null);

  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, "users", auth.currentUser.uid), { isOnline: false });
        } catch (err) {
          console.warn("Could not handle isOnline on logout:", err);
        }
      }
      await auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.replace('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  logoutRef.current = logout;

  // Track inactivity (20 minutes)
  useEffect(() => {
    if (!user) return;
    let idleTimeout: ReturnType<typeof setTimeout>;

    const resetIdleTimeout = () => {
      clearTimeout(idleTimeout);
      // 20 minutes = 1200000 ms
      idleTimeout = setTimeout(() => {
        if (logoutRef.current) {
          console.log("Auto logging out due to inactivity");
          logoutRef.current();
        }
      }, 1200000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetIdleTimeout));

    resetIdleTimeout();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(e => document.removeEventListener(e, resetIdleTimeout));
    };
  }, [user]);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous profile listener if any
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (firebaseUser && !firebaseUser.isAnonymous) {
        setUser(firebaseUser);
        updateDoc(doc(db, "users", firebaseUser.uid), { isOnline: true }).catch(err => {
          console.warn("Could not set isOnline (user document might not exist yet):", err);
        });
        
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
        setUser(null);
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
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isRestricted, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
