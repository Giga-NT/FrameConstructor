import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser, isInitialized } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] currentUser:', currentUser, 'isInitialized:', isInitialized);

  if (!isInitialized) {
    console.log('[ProtectedRoute] Auth not initialized, showing loader');
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering children');
  return children;
};