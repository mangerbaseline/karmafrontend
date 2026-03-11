# Salon Management System (MVP)

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine. You can download and install it from [nodejs.org](https://nodejs.org/).

## Installation

1. Open your terminal in the project root directory.
2. Install the necessary dependencies by running:

```bash
npm install
```

## Running the Application

To start the development server, run:

```bash
npm run dev
```

## Troubleshooting

### Backend Connection
**Note:** First Run Backend might give a slow response or error.
Please try to refresh the page first if it does not work. This is often due to the backend service spinning up from a cold start.


## Backend tenancy + CORS notes
- Use the SAME tenant host for frontend and backend (Host header resolves tenant).
- Example: open frontend at http://demo.local and set VITE_API_URL=http://demo.local/api
- If you run frontend on localhost:5173, backend must allow CORS origin http://localhost:5173


## Dev quickstart (tenancy-safe)
1) Add demo.local to your hosts file pointing to your backend.
2) Use `.env` with `VITE_API_URL=/api`.
3) Run `npm install` then `npm run dev`.

This uses Vite proxy (vite.config.js) so backend receives Host=demo.local and resolves tenant correctly.


## Added: Salon picker + guards
- After login, app auto-fetches /api/me and /api/me/salons.
- If user has salons but none selected, a modal forces selection.
- Tenant-scoped pages show a friendly message until a salon is selected.


## Added (Next patch)
- Toasts (global notifications)
- 401 session expiry handling (auto logout)
- Tenant Members screen (/tenant-members) (OWNER/superadmin)
- Salon switcher in header


## UX Pack
- Skeleton loading on Services/Staff/Appointments
- Empty states (no data)
- Inline validation in Service/Staff modals


## P2 Pack
- Appointments: Week calendar view + list toggle
- Conflict handling: 409 shows warning toast (slot not available)


## P3 Pack
- Appointments: staff filter (server-side via fetchAppointments staff_id)
- Week calendar: drag & drop appointment onto a day to reschedule (keeps time)


## P4 Pack
- Week calendar upgraded to time grid with business hours (08–20)
- Drag & drop onto exact time slot (snaps to 30 min)
- Hover tooltip via title attribute


## Enterprise UI pack
- Role-based navigation (OWNER/ADMIN/RECEPTION/STAFF)
- Activity log page (/audit)


## Stabilization P0
- ErrorBoundary (safe crash screen + error id)
- apiClient (timeout + retry on 429/503 + normalized errors + request id)
- Route guards: auth, salon required, permission required


## Stabilization P1
- AbortController in contexts (no setState on unmounted)
- Disable submit while saving (prevents double requests)
- 422 field-level errors mapping helper
- Basic route-level code splitting (React.lazy + Suspense)


## P1.5
- Fixed Appointments page (was broken)
- Appointment modal: disable submit + inline 422 field errors
- LoadingButton component for consistent UX


## Full P1 hardening
- apiCall: request dedupe (prevents double requests), 422 handled inline (no global toast)
- Context fetch: dedupe keys
- Added useSubmitGuard helper
