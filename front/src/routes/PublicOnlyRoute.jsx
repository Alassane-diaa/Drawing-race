import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PublicOnlyRoute({ children }) {
    const { isUser, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isUser) {
        return <Navigate to="/" replace />;
    }

    return children;
}
