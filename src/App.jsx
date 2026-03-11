import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const LayoutShell = React.lazy(() => import("./pages/LayoutShell"));
const DashboardPage = React.lazy(() => import("./pages/Dashboard"));
const ServicesPage = React.lazy(() => import("./pages/Services"));
const StaffPage = React.lazy(() => import("./pages/Staff"));
const AppointmentPage = React.lazy(() => import("./pages/Appointments"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const TenantMembers = React.lazy(() => import("./pages/TenantMembers"));
const AuditLog = React.lazy(() => import("./pages/AuditLog"));
const Login = React.lazy(() => import("./pages/Login"));

import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./routes/PrivateRoute";
import RequireSalon from "./routes/RequireSalon";
import RequirePermission from "./routes/RequirePermission";


import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { ServiceProvider } from "./context/ServiceContext";
import { StaffProvider } from "./context/StaffContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ToastProvider>
      <UserProvider>
        <ServiceProvider>
          <StaffProvider>
            <AppointmentProvider>
              <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading…</div>}>
              <Routes>
  <Route path="/login" element={<Login />} />

  <Route element={<PrivateRoute />}>
    <Route element={<LayoutShell />}>
      <Route
        path="/"
        element={
          <RequireSalon>
            <DashboardPage />
          </RequireSalon>
        }
      />

      <Route
        path="/services"
        element={
          <RequireSalon>
            <RequirePermission action="manage_catalog">
              <ServicesPage />
            </RequirePermission>
          </RequireSalon>
        }
      />

      <Route
        path="/staff"
        element={
          <RequireSalon>
            <RequirePermission action="manage_staff">
              <StaffPage />
            </RequirePermission>
          </RequireSalon>
        }
      />

      <Route
        path="/appointments"
        element={
          <RequireSalon>
            <RequirePermission action="manage_appointments">
              <AppointmentPage />
            </RequirePermission>
          </RequireSalon>
        }
      />

      <Route
        path="/tenant-members"
        element={
          <RequireSalon>
            <RequirePermission action="manage_members">
              <TenantMembers />
            </RequirePermission>
          </RequireSalon>
        }
      />

      <Route
        path="/audit"
        element={
          <RequireSalon>
            <RequirePermission action="view_audit">
              <AuditLog />
            </RequirePermission>
          </RequireSalon>
        }
      />

      <Route
        path="/settings"
        element={
          <RequireSalon>
            <RequirePermission action="manage_settings">
              <SettingsPage />
            </RequirePermission>
          </RequireSalon>
        }
      />
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
            </Suspense>

            </AppointmentProvider>
          </StaffProvider>
        </ServiceProvider>
      </UserProvider>
      </ToastProvider>
          </ErrorBoundary>
    </BrowserRouter>
  );
}