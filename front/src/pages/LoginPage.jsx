import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import { authService } from '../services/authService';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const getSafeReturnPath = () => {
        const fromPath = location.state?.from?.pathname;
        const forbiddenPaths = ['/', '/login', '/register'];

        if (!fromPath || forbiddenPaths.includes(fromPath)) {
            return '/home';
        }

        return fromPath;
    };
    
    const handleLogin = async (user, setMessage) => {
        try {
            const data = await authService.login(user.username, user.password);
            login(data.token, { username: user.username });

            navigate(getSafeReturnPath(), { replace: true });
        } catch (err) {
            console.error(err);
            setMessage("Login failed.");
        }
    };

    const loginUserFn = (user, setMessage) => {
        handleLogin(user, setMessage);
    };

    return (
        <div className="wrapper">
            <div className="card">
                <AuthForm title="Login" buttonText="Sign In" auth_fn={loginUserFn} />
            </div>
            <div className="footer">
                No account? Create an account here: <Link to="/register" state={{ from: location.state?.from || { pathname: '/home' } }}>Register</Link>
            </div>
        </div>
    );
}
