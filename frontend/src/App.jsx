import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import MarkAttendance from "./pages/MarkAttendance";
import Layout from "./components/Layout";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            {user?.role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
          </Layout>
        </PrivateRoute>
      }/>
      <Route path="/mark-attendance" element={
        <PrivateRoute role="admin">
          <Layout><MarkAttendance /></Layout>
        </PrivateRoute>
      }/>
    </Routes>
  );
}