import { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { useAppointment } from "../context/AppointmentContext";
import { useServices } from "../context/ServiceContext";
import { useStaff } from "../context/StaffContext";
import { toast } from "../lib/toast";
import { fromDateTimeLocalInput, formatLocalDateTime } from "../lib/datetime";
import { normalizeFieldErrors } from "../lib/fieldErrors";
import WeekCalendar from "../components/WeekCalendar";
import { SkeletonCard } from "../components/Skeleton";
import LoadingButton from "../components/LoadingButton";

function AppointmentModal({ open, onClose, initial, services, staff, onSubmit }) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [data, setData] = useState({
    service_id: "",
    staff_id: "",
    client_name: "",
    client_phone: "",
    start_at: "",
    notes: "",
    status: "scheduled",
  });

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setFieldErrors({});
    setSaving(false);

    if (initial) {
      setData({
        service_id: String(initial.service_id ?? initial.service?.id ?? ""),
        staff_id: String(initial.staff_id ?? initial.staff?.id ?? ""),
        client_name: initial.client_name ?? initial.client?.name ?? "",
        client_phone: initial.client_phone ?? initial.client?.phone ?? "",
        start_at: (initial.start_at || initial.starts_at || "").slice(0, 16),
        notes: initial.notes ?? "",
        status: initial.status ?? "scheduled",
      });
    } else {
      setData({
        service_id: "",
        staff_id: "",
        client_name: "",
        client_phone: "",
        start_at: "",
        notes: "",
        status: "scheduled",
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const validate = () => {
    const fe = {};
    if (!data.service_id) fe.service_id = "Required";
    if (!data.staff_id) fe.staff_id = "Required";
    if (!data.client_name.trim()) fe.client_name = "Required";
    if (!data.start_at) fe.start_at = "Required";
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    const payload = {
      service_id: Number(data.service_id),
      staff_id: Number(data.staff_id),
      client_name: data.client_name.trim(),
      client_phone: data.client_phone.trim(),
      start_at: fromDateTimeLocalInput(data.start_at),
      notes: data.notes,
      status: data.status,
    };

    try {
      const res = await onSubmit(payload, initial?.id);
      if (res?.success) {
        toast(initial ? "Appointment updated." : "Appointment created.", "success");
        onClose();
      } else {
        setFormError(res?.message || "Failed to save appointment.");
        setFieldErrors(normalizeFieldErrors(res?.errors));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{initial ? "Edit appointment" : "New appointment"}</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Close
          </button>
        </div>

        {formError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>
        )}

        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-gray-600">Service *</label>
            <select
              value={data.service_id}
              onChange={(e) => setData((p) => ({ ...p, service_id: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {fieldErrors.service_id && <div className="mt-1 text-xs text-red-700">{fieldErrors.service_id}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Staff *</label>
            <select
              value={data.staff_id}
              onChange={(e) => setData((p) => ({ ...p, staff_id: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {fieldErrors.staff_id && <div className="mt-1 text-xs text-red-700">{fieldErrors.staff_id}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Client name *</label>
            <input
              value={data.client_name}
              onChange={(e) => setData((p) => ({ ...p, client_name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="Name"
            />
            {fieldErrors.client_name && <div className="mt-1 text-xs text-red-700">{fieldErrors.client_name}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Client phone</label>
            <input
              value={data.client_phone}
              onChange={(e) => setData((p) => ({ ...p, client_phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="+387..."
            />
            {fieldErrors.client_phone && <div className="mt-1 text-xs text-red-700">{fieldErrors.client_phone}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Start *</label>
            <input
              type="datetime-local"
              value={data.start_at}
              onChange={(e) => setData((p) => ({ ...p, start_at: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            {fieldErrors.start_at && <div className="mt-1 text-xs text-red-700">{fieldErrors.start_at}</div>}
          </div>

          <div>
            <label className="text-xs text-gray-600">Status</label>
            <select
              value={data.status}
              onChange={(e) => setData((p) => ({ ...p, status: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {["scheduled", "completed", "canceled"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Notes</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={saving}
              loadingText="Saving…"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Appointments() {
  const { activeSalonId } = useUser();
  const { appointments, loading, fetchAppointments, rescheduleAppointment, createAppointment, updateAppointment } = useAppointment();
  const { services, loading: servicesLoading } = useServices();
  const { staff, loading: staffLoading } = useStaff();

  const [view, setView] = useState("calendar");
  const [weekDate, setWeekDate] = useState(() => new Date());
  const [staffFilterId, setStaffFilterId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!activeSalonId) return;
    const ctrl = new AbortController();
    fetchAppointments(staffFilterId ? { staff_id: staffFilterId } : {}, { signal: ctrl.signal });
    return () => ctrl.abort();
  }, [activeSalonId, staffFilterId, fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    if (!staffFilterId) return appointments;
    return appointments.filter((a) => String(a.staff_id ?? a.staff?.id ?? "") === String(staffFilterId));
  }, [appointments, staffFilterId]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onOpen = (a) => {
    setEditing(a);
    setModalOpen(true);
  };

  const handleDropSlot = async (appointmentId, slot) => {
    const { dayIso, hour, minute } = slot;
    const appt = appointments.find((a) => String(a.id) === String(appointmentId));
    if (!appt) return;

    const startRaw = appt.start_at || appt.starts_at || appt.start || appt.start_time;
    const dt = startRaw ? new Date(startRaw) : null;
    if (!dt || isNaN(dt.getTime())) return toast("Can't reschedule: invalid start time.", "error");

    const [y, m, d] = dayIso.split("-").map((x) => Number(x));
    const newDt = new Date(dt);
    newDt.setFullYear(y, m - 1, d);
    newDt.setHours(Number(hour), Number(minute), 0, 0);

    const start_at = formatLocalDateTime(newDt);
const res = await rescheduleAppointment(appt.id, { start_at, staff_id: appt.staff_id ?? appt.staff?.id });
    if (res?.success) {
      toast("Appointment moved.", "success");
      await fetchAppointments(staffFilterId ? { staff_id: staffFilterId } : {});
    }
  };

  const submitModal = async (payload, id) => {
    if (id) return await updateAppointment(id, payload);
    return await createAppointment(payload);
  };

  if (!activeSalonId) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Select a salon</h2>
          <p className="mt-1 text-sm text-gray-600">Choose a salon to manage appointments.</p>
        </div>
      </div>
    );
  }

  const toolbarDisabled = servicesLoading || staffLoading;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600">Calendar & list management.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNew}
            disabled={toolbarDisabled}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            New appointment
          </button>

          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-xl border px-3 py-2 text-sm ${view === "calendar" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-xl border px-3 py-2 text-sm ${view === "list" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}
          >
            List
          </button>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <div className="hidden items-center gap-2 md:flex">
            <span className="text-xs text-gray-600">Staff:</span>
            <select
              value={staffFilterId}
              onChange={(e) => setStaffFilterId(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900"
              disabled={staffLoading}
            >
              <option value="">All</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setWeekDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setWeekDate(new Date())}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <WeekCalendar
            weekDate={weekDate}
            appointments={filteredAppointments}
            onOpen={onOpen}
            onDropSlot={handleDropSlot}
            businessStartHour={8}
            businessEndHour={20}
            slotMinutes={30}
          />
        )
      ) : loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-600">Create your first appointment to start the day.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredAppointments.map((a) => (
            <button
              key={a.id}
              onClick={() => onOpen(a)}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
            >
              <div className="text-xs text-gray-600">{(a.start_at || a.starts_at || "").replace("T", " ").slice(0, 16)}</div>
              <div className="mt-1 font-semibold text-gray-900">{a.service?.name || a.service_name || "Service"}</div>
              <div className="text-sm text-gray-700">{a.client?.name || a.client_name || "Client"}</div>
              <div className="mt-2 text-xs text-gray-500">{a.staff?.name || a.staff_name || ""}</div>
            </button>
          ))}
        </div>
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        services={services}
        staff={staff}
        onSubmit={submitModal}
      />
    </div>
  );
}
