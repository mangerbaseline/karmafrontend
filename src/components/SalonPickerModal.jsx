import { useEffect, useMemo, useState } from "react";

export default function SalonPickerModal({ open, salons = [], activeSalonId, onSelect }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return salons;
    return salons.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [salons, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select salon</h2>
            <p className="text-sm text-gray-600">
              You must pick a salon before using services, staff, appointments, etc.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search salons..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
          />
        </div>

        <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-gray-100">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No salons found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((s) => {
                const selected = String(activeSalonId) === String(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(s.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">ID: {s.id}</div>
                      </div>
                      {selected ? (
                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-700">
                          Select
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (!activeSalonId && salons?.length) onSelect?.(salons[0].id);
            }}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
