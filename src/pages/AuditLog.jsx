import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { can } from "../lib/permissions";
import { toast } from "../lib/toast";

export default function AuditLog() {
  const { apiCall, membershipRole, user } = useUser();
  const role = user?.is_superadmin ? "SUPERADMIN" : membershipRole;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const allowed = can(role, "view_audit");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiCall("internal/audit");
      setItems(res?.data ?? res ?? []);
    } catch {
      toast("Failed to load audit log.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (allowed) load(); }, [allowed]);

  if (!allowed) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
          <p className="mt-1 text-sm text-gray-600">Your role doesn’t allow viewing the audit log.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activity log</h1>
          <p className="text-sm text-gray-600">Who did what, and when.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No activity.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-xs text-gray-600">{a.created_at ?? ""}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{a.actor?.name ?? "System"}</div>
                    <div className="text-xs text-gray-600">{a.actor?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">{a.action}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-900">{a.entity_type}</div>
                    <div className="text-xs text-gray-600">{a.entity_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <pre className="max-w-[520px] overflow-auto rounded-xl bg-gray-50 p-2 text-[11px] text-gray-700">{JSON.stringify(a.meta ?? {}, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
