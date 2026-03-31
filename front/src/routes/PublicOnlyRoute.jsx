import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PublicOnlyRoute({ children }) {
    const { isUser, isLoading } = useAuth();
    const location = useLocation();

    const getSafeReturnPath = () => {
        const fromPath = location.state?.from?.pathname;
        const forbiddenPaths = ['/', '/login', '/register'];

        if (!fromPath || forbiddenPaths.includes(fromPath)) {
            return '/home';
        }

        return fromPath;
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isUser) {
        return <Navigate to={getSafeReturnPath()} replace />;
    }

    return children;
}
