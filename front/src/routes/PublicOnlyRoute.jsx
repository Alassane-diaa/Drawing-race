import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PublicOnlyRoute({ children }) {
    const { isUser, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isUser) {
        return <Navigate to={location.state?.from?.pathname || '/home'} replace />;
    }

    return children;
}
