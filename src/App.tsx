import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterForm as RegisterPage } from './pages/RegisterPage';
import FrameModel from './components/FrameModel/FrameModel';
import { UserDashboard } from './pages/UserDashboard';
import { VerifyAccount } from './pages/VerifyAccount';
import GreenhouseModel from './components/GreenhouseModel/GreenhouseModel';
import { OrderPage } from './pages/OrderPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import GazeboModel from './components/GazeboModel/GazeboModel'; // Добавьте этот импорт

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyAccount />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/frame"
        element={
          <ProtectedRoute>
            <FrameModel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/greenhouse"
        element={
          <ProtectedRoute>
            <GreenhouseModel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gazebo" // Добавьте этот маршрут
        element={
          <ProtectedRoute>
            <GazeboModel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order"
        element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/order-details" 
        element={
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;