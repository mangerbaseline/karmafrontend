import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";
import { ApiError } from "../lib/apiClient";

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    if (activeSalonId) {
      fetchStaff({ signal: ctrl.signal });
    } else {
      setAllStaff([]);
    }
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSalonId]);

  const fetchStaff = async ({ signal } = {}) => {
    if (!activeSalonId) return;
    setLoading(true);
    try {
      const res = await apiCall("catalog/staff", { method: "GET", signal, dedupeKey: "GET:catalog/staff" });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setAllStaff(Array.isArray(data) ? data : []);
    } catch {
      // apiCall already toasts
    } finally {
      setLoading(false);
    }
  };

  const staff = useMemo(() => {
    return allStaff.filter((s) => {
      const matchesSearch = (s.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = s.is_active === true;
      if (filterStatus === "inactive") matchesStatus = s.is_active === false;
      return matchesSearch && matchesStatus;
    });
  }, [allStaff, filterStatus, searchQuery]);

  const addStaff = async (payload) => {
    try {
      const created = await apiCall("catalog/staff", { method: "POST", body: payload });
      const member = created?.data ?? created;
      setAllStaff((prev) => [member, ...prev]);
      return { success: true, staff: member };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to add staff" };
    }
  };

  const updateStaff = async (id, payload) => {
    try {
      const updated = await apiCall(`catalog/staff/${id}`, { method: "PUT", body: payload });
      const member = updated?.data ?? updated;
      setAllStaff((prev) => prev.map((s) => (s.id === id ? member : s)));
      return { success: true, staff: member };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to update staff" };
    }
  };

  const toggleStaffActive = async (id, is_active) => updateStaff(id, { is_active });

  return (
    <StaffContext.Provider
      value={{
        allStaff,
        staff,
        loading,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        fetchStaff,
        addStaff,
        updateStaff,
        toggleStaffActive,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
