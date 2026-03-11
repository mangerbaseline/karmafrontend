import { Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout";
import { useUser } from "../context/UserContext";

export default function LayoutShell() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
