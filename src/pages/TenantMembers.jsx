import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { toast } from "../lib/toast";

export default function TenantMembers() {
  const { apiCall, membershipRole, user } = useUser();
  const isOwner = membershipRole === "OWNER" || user?.is_superadmin;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STAFF");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiCall("tenant/members");
      setItems(res?.data ?? res ?? []);
    } catch (e) {
      toast("Failed to load members.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addOrUpdate = async () => {
    if (!email.trim()) return toast("Email is required.", "warning");
    try {
      await apiCall("tenant/members", { method: "PUT", body: { email: email.trim(), role } });
      toast("Member updated.", "success");
      setEmail("");
      setRole("STAFF");
      await load();
    } catch (e) {
      toast("Could not update member. Make sure user exists.", "error");
    }
  };

  const remove = async (userId) => {
    if (!confirm("Remove this member from tenant?")) return;
    try {
      await apiCall(`tenant/members/${userId}`, { method: "DELETE" });
      toast("Member removed.", "success");
      await load();
    } catch (e) {
      toast("Could not remove member.", "error");
    }
  };

  if (!isOwner) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
          <p className="mt-1 text-sm text-gray-600">Only OWNER (or superadmin) can manage tenant members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tenant Members</h1>
          <p className="text-sm text-gray-600">Manage who can access this tenant.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="staff@example.com" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
              {["OWNER","ADMIN","STAFF","RECEPTION"].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={addOrUpdate} className="w-full rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Add / Update</button>
          </div>
        </div>

        <div className="mt-5 overflow-auto rounded-xl border border-gray-100">
          {loading ? (
            <div className="p-4 text-sm text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No members.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{m.user?.name ?? "User"}</div>
                      <div className="text-xs text-gray-600">{m.user?.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3">{m.role}</td>
                    <td className="px-4 py-3">{m.status}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(m.user_id)} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs hover:bg-gray-50">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
