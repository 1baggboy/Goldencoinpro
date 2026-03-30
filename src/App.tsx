import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { NotificationProvider } from "./NotificationContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Transactions } from "./pages/Transactions";
import { Deposit } from "./pages/Deposit";
import { KYC } from "./pages/KYC";
import { Withdraw } from "./pages/Withdraw";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDetail } from "./pages/UserDetail";
import { Profile } from "./pages/Profile";
import { Invest } from "./pages/Invest";
import { Landing } from "./pages/Landing";
import { Restricted } from "./pages/Restricted";
import { FAQ } from "./pages/FAQ";
import { TwoFactorSetup } from "./pages/TwoFactorSetup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { PrivacyPolicy, TermsOfService, RiskDisclaimer } from "./pages/Legal";
import { SupportWidget } from "./components/SupportWidget";

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading, isAdmin, isRestricted } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0B0B0B] text-[#C9A96E]">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  // Handle restricted users
  if (isRestricted && !isAdmin) {
    if (location.pathname !== "/restricted") {
      return <Navigate to="/restricted" replace />;
    }
  } else {
    // If not restricted, don't allow access to /restricted
    if (location.pathname === "/restricted") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
            <Route path="/2fa/setup" element={
              <ProtectedRoute>
                <TwoFactorSetup />
              </ProtectedRoute>
            } />
            <Route path="/restricted" element={
              <ProtectedRoute>
                <Restricted />
              </ProtectedRoute>
            } />
            
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
            
            <Route path="/withdraw" element={
              <ProtectedRoute>
                <Layout>
                  <Withdraw />
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
          <SupportWidget />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
