import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HrDashboard from "./pages/HrDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("staffsync_user") || "null");
  } catch {
    return null;
  }
}

function DashboardRedirect() {
  const user = getStoredUser();

  if (!localStorage.getItem("staffsync_token") || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "Employee") {
    return <Navigate to="/employee-dashboard" replace />;
  }

  if (user.role === "HR") {
    return <Navigate to="/hr-dashboard" replace />;
  }

  if (user.role === "Manager") {
    return <Navigate to="/manager-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("staffsync_token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-dashboard"
          element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <HrDashboard />
          </ProtectedRoute>
        }
      /> 

        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;