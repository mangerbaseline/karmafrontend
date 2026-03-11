import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "./UserContext";
import { ApiError } from "../lib/apiClient";

const ServiceContext = createContext(null);

export function ServiceProvider({ children }) {
  const { apiCall, activeSalonId } = useUser();
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    if (activeSalonId) {
      fetchServices({ signal: ctrl.signal });
    } else {
      setAllServices([]);
    }
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSalonId]);

  const fetchServices = async ({ signal } = {}) => {
    if (!activeSalonId) return;
    setLoading(true);
    try {
      const res = await apiCall("catalog/services", { method: "GET", signal, dedupeKey: "GET:catalog/services" });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setAllServices(Array.isArray(data) ? data : []);
    } catch {
      // apiCall already toasts
    } finally {
      setLoading(false);
    }
  };

  const services = useMemo(() => {
    return allServices.filter((s) => {
      const matchesSearch = (s.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === "active") matchesStatus = s.is_active === true;
      if (filterStatus === "inactive") matchesStatus = s.is_active === false;
      return matchesSearch && matchesStatus;
    });
  }, [allServices, filterStatus, searchQuery]);

  const addService = async (payload) => {
    try {
      const created = await apiCall("catalog/services", { method: "POST", body: payload });
      const service = created?.data ?? created;
      setAllServices((prev) => [service, ...prev]);
      return { success: true, service };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to add service" };
    }
  };

  const updateService = async (id, payload) => {
    try {
      const updated = await apiCall(`catalog/services/${id}`, { method: "PUT", body: payload });
      const service = updated?.data ?? updated;
      setAllServices((prev) => prev.map((s) => (s.id === id ? service : s)));
      return { success: true, service };
    } catch (e) {
      if (e instanceof ApiError) return { success: false, message: e.message, errors: e.errors || null };
      return { success: false, message: e?.message || "Failed to update service" };
    }
  };

  const toggleServiceActive = async (id, is_active) => updateService(id, { is_active });

  return (
    <ServiceContext.Provider
      value={{
        allServices,
        services,
        loading,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        fetchServices,
        addService,
        updateService,
        toggleServiceActive,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}
