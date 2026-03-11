import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { ApiError } from "../lib/apiClient";

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    if (activeSalonId) {
      fetchAppointments({}, { signal: ctrl.signal });
    } else {
      setAppointments([]);
    }
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSalonId]);

  const fetchAppointments = async (filters = {}, { signal } = {}) => {
    if (!activeSalonId) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.status) query.append("status", filters.status);
      if (filters.staff_id) query.append("staff_id", filters.staff_id);
      if (filters.from) query.append("from", filters.from);
      if (filters.to) query.append("to", filters.to);

      const endpoint = `appointments${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await apiCall(endpoint, { method: "GET", signal, dedupeKey: `GET:${endpoint}` });

      const data = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (payload) => {
    try {
      const created = await apiCall("appointments", { method: "POST", body: payload });
      const appt = created?.data ?? created;
      setAppointments((prev) => [appt, ...prev]);
      return { success: true, appointment: appt };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to create appointment" };
    }
  };

  const updateAppointment = async (id, payload) => {
    try {
      const updated = await apiCall(`appointments/${id}`, { method: "PUT", body: payload });
      const appt = updated?.data ?? updated;
      setAppointments((prev) => prev.map((a) => (a.id === id ? appt : a)));
      return { success: true, appointment: appt };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to update appointment" };
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const updated = await apiCall(`appointments/${id}/cancel`, { method: "POST" });
      const appt = updated?.data ?? updated;
      setAppointments((prev) => prev.map((a) => (a.id === id ? appt : a)));
      return { success: true, appointment: appt };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to cancel appointment" };
    }
  };

  const rescheduleAppointment = async (id, payload) => {
    try {
      const updated = await apiCall(`appointments/${id}/reschedule`, { method: "POST", body: payload });
      const appt = updated?.data ?? updated;
      setAppointments((prev) => prev.map((a) => (a.id === id ? appt : a)));
      return { success: true, appointment: appt };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to reschedule appointment" };
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        rescheduleAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointment must be used within AppointmentProvider");
  return ctx;
}
