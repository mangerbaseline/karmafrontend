export function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Format Date -> "YYYY-MM-DD HH:mm:ss" in LOCAL time (no timezone conversion).
 */
export function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

export function formatLocalDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

/**
 * Convert <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") -> "YYYY-MM-DD HH:mm:ss"
 */
export function fromDateTimeLocalInput(value) {
  if (!value || typeof value !== "string") return null;
  // value is local already
  const v = value.trim();
  // Accept both "YYYY-MM-DDTHH:mm" and "YYYY-MM-DD HH:mm"
  const normalized = v.replace("T", " ");
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) return null;
  return `${normalized}:00`;
}
