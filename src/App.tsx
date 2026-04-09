import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { Navbar } from "./components/Navbar";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Login from "./pages/auth/Login";
import StudentDashboard from "./pages/student/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import Mentor from "./pages/student/Mentor";
import Quiz from "./pages/student/Quiz";
import Coding from "./pages/student/Coding";

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
  if (!user) return <Navigate to="/auth/login" />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isCodingPage = location.pathname === '/student/coding';

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {user && <Navbar />}
      <main className={isCodingPage ? "flex-grow flex flex-col overflow-hidden" : "container mx-auto py-6 px-4 overflow-auto"}>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'admin' || user?.role === 'teacher' ? <AdminDashboard /> : <StudentDashboard />}
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/mentor" element={
            <ProtectedRoute role="student">
              <Mentor />
            </ProtectedRoute>
          } />

          <Route path="/student/quiz" element={
            <ProtectedRoute role="student">
              <Quiz />
            </ProtectedRoute>
          } />

          <Route path="/student/coding" element={
            <ProtectedRoute role="student">
              <Coding />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
