import { useUser } from "../context/UserContext";
import { can } from "../lib/permissions";

export default function RequirePermission({ action, children }) {
  const { membershipRole, user } = useUser();
  const role = user?.is_superadmin ? "SUPERADMIN" : membershipRole;

  if (!can(role, action)) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
          <p className="mt-1 text-sm text-gray-600">Your role doesn’t have permission for this action.</p>
        </div>
      </div>
    );
  }

  return children;
}
