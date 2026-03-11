export function normalizeFieldErrors(errors) {
  // Backend may return { field: ["msg1","msg2"] } or { field: "msg" }
  if (!errors || typeof errors !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(errors)) {
    if (Array.isArray(v)) out[k] = v.filter(Boolean).join(" ");
    else out[k] = String(v ?? "");
  }
  return out;
}
