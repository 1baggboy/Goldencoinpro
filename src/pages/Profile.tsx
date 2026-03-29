import React, { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Save, Camera, AlertCircle, Phone, Users } from "lucide-react";
import { useAuth } from "../AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export const Profile = () => {
  const { profile, user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setGender(profile.gender || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 1MB for Firestore document limit)
    if (file.size > 1024 * 1024) {
      setMessage({ type: 'error', text: "Image too large. Max 1MB." });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: base64String
        });
        setPhotoURL(base64String);
        setMessage({ type: 'success', text: "Profile picture updated!" });
      } catch (error) {
        console.error("Upload error:", error);
        setMessage({ type: 'error', text: "Failed to upload image." });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    setMessage(null);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phoneNumber,
        gender,
        photoURL
      });
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage({ type: 'error', text: "Failed to update profile. Please try again." });
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = 
    displayName !== (profile?.displayName || "") ||
    phoneNumber !== (profile?.phoneNumber || "") ||
    gender !== (profile?.gender || "") ||
    photoURL !== (profile?.photoURL || "");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center text-[#C9A96E]">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-gray-400">Manage your personal information and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-8 text-center relative overflow-hidden group">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-[#C9A96E]/10 border-2 border-[#C9A96E]/30 rounded-full flex items-center justify-center text-[#C9A96E] text-4xl font-bold overflow-hidden">
                {uploading ? (
                  <div className="animate-pulse">...</div>
                ) : photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile?.displayName?.charAt(0) || "U"
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-[#C9A96E] text-[#0B0B0B] rounded-full shadow-lg cursor-pointer hover:bg-[#D4B985] transition-all">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <h3 className="text-xl font-bold text-white truncate">{profile?.displayName}</h3>
            <p className="text-sm text-gray-500 mb-6 truncate">{profile?.email}</p>
            
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#C9A96E]/5 rounded-xl border border-[#C9A96E]/10">
              <ShieldCheck size={16} className="text-[#C9A96E]" />
              <span className="text-xs font-bold text-[#C9A96E] uppercase tracking-widest">
                {profile?.kycStatus?.replace('_', ' ')}
              </span>
            </div>
            
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C9A96E]/5 rounded-full blur-2xl group-hover:bg-[#C9A96E]/10 transition-all duration-500"></div>
          </div>

          <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Account Info</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Role</span>
                <span className="text-xs font-bold text-white capitalize">{profile?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Member Since</span>
                <span className="text-xs font-bold text-white">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "---"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Account ID</span>
                <span className="text-[10px] font-mono text-gray-500">{user?.uid.substring(0, 12)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#121212] border border-[#C9A96E]/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-8">Personal Information</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">Sex / Gender</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#C9A96E]/40 transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-sm font-bold text-gray-400">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={profile?.email || ""}
                    readOnly
                    className="w-full bg-[#0B0B0B] border border-[#C9A96E]/10 rounded-xl py-3 pl-12 pr-4 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl flex items-center gap-3 text-sm font-medium",
                    message.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  )}
                >
                  <AlertCircle size={18} />
                  {message.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={updating || !hasChanges}
                className="w-full bg-[#C9A96E] text-[#0B0B0B] font-bold py-4 rounded-xl hover:bg-[#D4B985] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
