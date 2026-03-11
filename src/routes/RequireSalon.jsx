import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function RequireSalon({ children }) {
  const { activeSalonId, salonsLoaded, salons } = useUser();

  // While salons are loading, show lightweight loader
  if (!salonsLoaded) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="text-sm text-gray-600">Loading salons…</div>
        </div>
      </div>
    );
  }

  // If user has no salons at all
  if (salonsLoaded && (salons?.length ?? 0) === 0) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">No salons</h2>
          <p className="mt-1 text-sm text-gray-600">
            Your account isn’t assigned to any salon yet. Ask the OWNER to add you.
          </p>
        </div>
      </div>
    );
  }

  // If salons exist but none selected, SalonPickerModal in Layout will appear
  if (!activeSalonId) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Select a salon</h2>
          <p className="mt-1 text-sm text-gray-600">
            Please choose a salon to continue.
          </p>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
