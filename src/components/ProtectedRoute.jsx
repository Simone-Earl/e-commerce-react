import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If there is no logged-in user, redirect to the login page.
  // We pass the current location in state so we can redirect them back here after they log in.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in, render the protected component (like Profile)
  return children;
}