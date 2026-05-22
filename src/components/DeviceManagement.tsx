import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Shield, Smartphone, Globe, Clock, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

interface Device {
  id: string;
  deviceString: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastLogin: string;
  status: 'active' | 'revoked';
  deviceId: string;
}

export const DeviceManagement: React.FC = () => {
  const { logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const fetchDevices = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, "users", user.uid, "devices"));
      const querySnapshot = await getDocs(q);
      const deviceList: Device[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Device[];
      
      // Sort by most recent login
      setDevices(deviceList.sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()));
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevoke = async (id: string, deviceId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setRevokingId(id);
    setConfirmRevokeId(null); // Close modal
    try {
      // Remove from database
      await deleteDoc(doc(db, "users", user.uid, "devices", id));
      
      // If this is the CURRENT device, clear local storage to "logout"
      const currentDeviceId = localStorage.getItem('goldencoin_device_id');
      if (deviceId === currentDeviceId) {
        localStorage.removeItem('goldencoin_device_id');
        await logout(); // Actually sign out effectively
      }

      setDevices(prev => prev.filter(d => d.id !== id));
      toast.success("Device revoked successfully.");
    } catch (error) {
      console.error("Error revoking device:", error);
      toast.error("Failed to revoke device.");
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-[#C9A96E]" />
        <h2 className="text-xl font-bold text-white">Security & Devices</h2>
      </div>

      <p className="text-gray-400 text-sm">
        Review the devices that have accessed your account. If you see an unrecognized device, remove it immediately and change your password.
      </p>

      <div className="grid gap-4">
        <AnimatePresence>
          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-[#C9A96E]/30 transition-all"
            >
              {revokingId === device.id && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#C9A96E]">
                  {device.os.toLowerCase().includes('windows') || device.os.toLowerCase().includes('mac') ? (
                    <Globe className="w-6 h-6" />
                  ) : (
                    <Smartphone className="w-6 h-6" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{device.deviceString}</h3>
                    {device.deviceId === localStorage.getItem('goldencoin_device_id') && (
                      <span className="text-[10px] bg-[#C9A96E]/20 text-[#C9A96E] px-2 py-0.5 rounded-full font-bold uppercase">
                        Current Device
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {device.location || 'Unknown Location'} ({device.ip})
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(device.lastLogin).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setConfirmRevokeId(device.id)}
                disabled={revokingId === device.id}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors group-hover:opacity-100 opacity-60"
                title="Revoke Access"
              >
                 <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmRevokeId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl"
              >
                <h3 className="text-lg font-bold text-white mb-2">Revoke Device</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to revoke access for this device? You will be signed out from it.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmRevokeId(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                        const dev = devices.find(d => d.id === confirmRevokeId);
                        if (dev) handleRevoke(dev.id, dev.deviceId);
                    }}
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Revoke Access
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {devices.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-dashed border-white/10">
            No devices found.
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-[#C9A96E]/5 rounded-xl border border-[#C9A96E]/20">
        <div className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[#C9A96E] font-bold text-sm">Pro Tip: 2FA Authentication</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Enable Two-Factor Authentication (2FA) to add an extra layer of security. Even if someone steals your password, they won't be able to log in without the code from your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
