import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
    const { isUser, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isUser) {
        // Redirect to login, but save the location they tried to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}