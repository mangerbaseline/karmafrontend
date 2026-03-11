export function can(role, action) {
  // Superadmin can do everything
  if (role === "SUPERADMIN") return true;

  const matrix = {
    OWNER: new Set(["view_dashboard","manage_catalog","manage_staff","manage_appointments","manage_members","view_audit","manage_settings"]),
    ADMIN: new Set(["view_dashboard","manage_catalog","manage_staff","manage_appointments","view_audit","manage_settings"]),
    RECEPTION: new Set(["view_dashboard","manage_appointments"]),
    STAFF: new Set(["view_dashboard","manage_appointments"]),
  };

  return Boolean(matrix[role]?.has(action));
}
