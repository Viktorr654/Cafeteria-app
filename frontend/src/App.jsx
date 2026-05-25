import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import MyOrders from './pages/MyOrders';
import StaffDashboard from './pages/StaffDashboard';

function ProtectedRoute({ children, staffOnly }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (staffOnly && user.role !== 'staff') return <Navigate to="/menu" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute staffOnly={true}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}