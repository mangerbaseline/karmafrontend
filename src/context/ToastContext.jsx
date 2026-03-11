import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      const next = { id, ...e.detail };
      setItems((prev) => [...prev, next].slice(-5));
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3500);
    };
    window.addEventListener("krema:toast", onToast);
    return () => window.removeEventListener("krema:toast", onToast);
  }, []);

  const api = useMemo(() => ({ clear: () => setItems([]) }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex w-[92vw] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/90",
              t.type === "success" ? "border-green-200" : "",
              t.type === "error" ? "border-red-200" : "",
              t.type === "warning" ? "border-yellow-200" : "",
              "border-gray-200",
            ].join(" ")}
          >
            <div className="font-medium text-gray-900">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
