import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Transactions } from "./pages/Transactions";
import { Deposit } from "./pages/Deposit";
import { KYC } from "./pages/KYC";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDetail } from "./pages/UserDetail";
import { Profile } from "./pages/Profile";
import { Invest } from "./pages/Invest";
import { Landing } from "./pages/Landing";

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0B0B0B] text-[#C9A96E]">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/deposit" element={
            <ProtectedRoute>
              <Layout>
                <Deposit />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/kyc" element={
            <ProtectedRoute>
              <Layout>
                <KYC />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/invest" element={
            <ProtectedRoute>
              <Layout>
                <Invest />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/user/:userId" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <UserDetail />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
