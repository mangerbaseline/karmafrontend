import { useMemo } from "react";

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // Monday=0
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDay(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function dateKey(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const da = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}


function parseStart(a) {
  const s = a.start_at || a.starts_at || a.start || a.startAt || a.start_time;
  return s ? new Date(s) : null;
}

function pad(n) { return String(n).padStart(2, "0"); }

export default function WeekCalendar({
  weekDate,
  appointments = [],
  onOpen,
  onDropSlot,
  businessStartHour = 8,
  businessEndHour = 20,
  slotMinutes = 30,
}) {
  const weekStart = useMemo(() => startOfWeek(weekDate), [weekDate]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const slots = useMemo(() => {
    const res = [];
    for (let h = businessStartHour; h < businessEndHour; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        res.push({ h, m, label: `${pad(h)}:${pad(m)}` });
      }
    }
    return res;
  }, [businessStartHour, businessEndHour, slotMinutes]);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const dt = parseStart(a);
      if (!dt || isNaN(dt.getTime())) continue;
      const k = dateKey(dt);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push({ ...a, __dt: dt });
    }
    for (const [k, list] of map.entries()) list.sort((x, y) => x.__dt - y.__dt);
    return map;
  }, [appointments]);

  const onDrop = (e, dayIso, h, m) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      if (!payload?.appointmentId) return;
      onDropSlot?.(payload.appointmentId, { dayIso, hour: h, minute: m });
    } catch {
      // ignore
    }
  };

  const inBusiness = (dt) => {
    const h = dt.getHours();
    const m = dt.getMinutes();
    if (h < businessStartHour || h >= businessEndHour) return false;
    if (m % slotMinutes !== 0) return true; // still show, but not aligned
    return true;
  };

  const renderApptPills = (dayIso) => {
    const list = byDay.get(dayIso) || [];
    return list.map((a) => {
      const t = a.__dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      const title = a.service?.name || a.service_name || a.title || "Appointment";
      const client = a.client?.name || a.client_name || a.customer_name || "";
      const tooltip = `${t} • ${title}${client ? " • " + client : ""}`;
      const aligned = inBusiness(a.__dt);

      return (
        <button
          key={a.id}
          type="button"
          draggable
          title={tooltip}
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ appointmentId: a.id }));
            e.dataTransfer.effectAllowed = "move";
          }}
          onClick={() => onOpen?.(a)}
          className={[
            "mb-2 w-full rounded-xl border px-2 py-2 text-left text-xs hover:bg-gray-50",
            aligned ? "border-gray-200 bg-white" : "border-yellow-200 bg-yellow-50",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900">{t}</span>
            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700">
              {a.status || "scheduled"}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-gray-900">{title}</div>
          {client ? <div className="text-[11px] text-gray-600">{client}</div> : null}
        </button>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {days.map((d) => {
          const dayIso = dateKey(d);
          return (
            <div key={dayIso} className="rounded-xl border border-gray-100 p-2">
              <div className="mb-2 text-xs font-semibold text-gray-700">{fmtDay(d)}</div>

              <div className="mb-3">{renderApptPills(dayIso)}</div>

              <div className="rounded-xl border border-gray-100">
                {slots.map((s) => (
                  <div
                    key={`${dayIso}-${s.label}`}
                    className="flex items-center justify-between px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, dayIso, s.h, s.m)}
                    title="Drop here to move appointment to this exact time"
                  >
                    <span className="w-12">{s.label}</span>
                    <span className="text-gray-400">Drop</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: drag an appointment and drop onto a time slot to reschedule (snaps to {slotMinutes} min).
      </div>
    </div>
  );
}
