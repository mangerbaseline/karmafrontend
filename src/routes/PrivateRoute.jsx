import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function PrivateRoute() {
  const { isAuthenticated } = useUser();
  const loc = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
