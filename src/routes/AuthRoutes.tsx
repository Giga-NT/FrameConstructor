import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import FrameModel from '../components/FrameModel/FrameModel';

export const AuthRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={currentUser ? <FrameModel /> : <Navigate to="/login" />} 
      />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
    </Routes>
  );
};