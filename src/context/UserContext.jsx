import { createContext, useContext, useState, useEffect, useRef } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [membershipRole, setMembershipRole] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [salons, setSalons] = useState([]);
  const [salonsLoaded, setSalonsLoaded] = useState(false);
  const [activeSalonId, _setActiveSalonId] = useState(() => {
    const v = localStorage.getItem('activeSalonId');
    return v ? Number(v) : null;
  });

  const inflightRef = useRef(new Map());

  const setActiveSalonId = (id) => {
    const val = id ? Number(id) : null;
    _setActiveSalonId(val);
    if (val) localStorage.setItem('activeSalonId', String(val));
    else localStorage.removeItem('activeSalonId');
  };
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://demo.local/api";

async function tryLogin(baseUrl, credentials) {
  const candidates = [
    `${baseUrl}/auth/login`,
    `${baseUrl}/login`,
    // common Laravel patterns
    `${baseUrl}/auth/token`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data, url };
      }

      // If endpoint exists but returns validation/auth error, stop here (don't try others)
      if (![404, 405].includes(res.status)) {
        const errText = await res.text();
        return { ok: false, status: res.status, body: errText, url };
      }

      lastError = { status: res.status, url };
    } catch (e) {
      lastError = { error: String(e), url };
    }
  }

  return { ok: false, status: lastError?.status ?? 0, body: JSON.stringify(lastError ?? {}), url: lastError?.url };
}


  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        const payload = data.data ?? data;
        const u = payload.user ?? payload.data?.user ?? data.user;
        if (u) setUser(u);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        await fetchUserProfile(data.token);
        await fetchSalons(data.token);
        
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const fetchUserProfile = async (authToken = token) => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`${BASE_URL}/me`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Accept": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const payload = data.data ?? data;
        const u = payload.user ?? payload.data?.user ?? data.user;
        if (u) setUser(u);

        
        if (data.salons && Array.isArray(data.salons)) {
          const formattedSalons = data.salons.map(item => ({
            ...item.salon,
            role: item.role,
            pivotId: item.id
          }));
          
          setSalons(formattedSalons);
          
          if (formattedSalons.length > 0) {
            setActiveSalonId(prev => {
              const exists = formattedSalons.find(s => s.id === prev);
              return exists ? prev : formattedSalons[0].id;
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

const fetchSalons = async (authToken = token) => {
  if (!authToken) return;

  try {
    const response = await fetch(`${BASE_URL}/me/salons`, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const payload = data.data ?? data;
      const list = payload.salons ?? [];
      setSalons(list);

      if (list.length > 0) {
        setActiveSalonId((prev) => {
          const exists = list.find((s) => s.id === prev);
          return exists ? prev : list[0].id;
        });
      }
    }
  } catch (error) {
    console.error("Error fetching salons:", error);
  }
};

  const addSalon = async () => {
    return { success: false, message: 'Salon creation is done via onboarding/superadmin in this backend.' };
  };


const requireSalon = () => {
  return Boolean(activeSalonId);
};

  const logout = () => {
    setToken(null);
    setUser(null);
    setMembershipRole(null);
    setTenant(null);
    setSalons([]);
    setSalonsLoaded(false);
    setActiveSalonId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    headers: extraHeaders = {},
    timeoutMs = 12000,
    signal,
    dedupeKey, // optional custom key to prevent double requests
  } = options;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(activeSalonId ? { "X-Salon-Id": String(activeSalonId) } : {}),
    ...extraHeaders,
  };

  const url = `${BASE_URL}/${endpoint}`;
  const payload = body ? JSON.stringify(body) : undefined;

  // Dedupe: if same method+url in-flight, reuse promise (prevents double-click + StrictMode double effects)
  const key = dedupeKey || `${method}:${url}`;
  const inflight = inflightRef.current;
  if (inflight.has(key)) return inflight.get(key);

  const p = (async () => {
    try {
      const { data, status, requestId } = await (async () => {
        // Wrapper asíncrono para permitir el uso de await internamente
        return await requestJsonWithRetry(url, {
          method,
          headers,
          body: payload,
          timeoutMs,
          signal,
          maxRetries: 2,
        });
      })();

      // Normalize common backend envelopes
      return data?.data ?? data;
    } catch (e) {
      if (e instanceof ApiError) {
        // 409 handled as warning (conflicts)
        if (e.status === 409) {
          toast(e.message || "Time conflict: slot not available.", "warning");
          throw e;
        }

        // 422 should be handled by forms inline (no global toast spam)
        if (e.status === 422) {
          throw e;
        }

        // 401 auto logout
        if (e.status === 401) {
          toast("Session expired. Please log in again.", "warning");
          logout();
          throw e;
        }

        // Friendly error toast (+ request id if provided)
        const suffix = e.requestId ? ` (ref: ${e.requestId})` : "";
        toast(`${e.message}${suffix}`, "error");
        throw e;
      }

      // Network / timeout errors
      const msg = e?.name === "AbortError" ? "Request timed out. Please try again." : (e?.message || "Network error");
      toast(msg, "error");
      throw e;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
};


  const executeManualCall = async (endpoint, method = "GET", body = null) => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Tenant-scoped calls require X-Salon-Id
    const noSalonHeader = endpoint.startsWith('me') || endpoint.startsWith('/me') || endpoint.startsWith('tenant/') || endpoint.startsWith('/tenant/') || endpoint.startsWith('auth/') || endpoint.startsWith('/auth/');
    if (!noSalonHeader && activeSalonId) {
      headers['X-Salon-Id'] = String(activeSalonId);
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);
      
      if (response.status === 409) {
      const body = await response.text();
      let msg = 'Time conflict: slot is no longer available.';
      try {
        const j = JSON.parse(body);
        msg = j?.message || j?.error || msg;
      } catch {
        msg = body || msg;
      }
      toast(msg, 'warning');
      throw new Error(msg);
    }

    if (response.status === 401) {
        logout();
        return { ok: false, status: 401, message: "Unauthorized" };
      }

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error("API Call Error:", error);
      return { ok: false, status: 500, error: error.message };
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          await fetchUserProfile(storedToken);
          await fetchSalons(storedToken);
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      token, 
      salons,
      loading,
      activeSalonId,
      setActiveSalonId,
      addSalon,
      login, 
      logout, 
      apiCall, 
      isAuthenticated: !!token 
    ,
    salonsLoaded,
    requireSalon,
    membershipRole,
    tenant}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};