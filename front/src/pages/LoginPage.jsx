import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import { authService } from '../services/authService';
import './LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const handleLogin = async (user, setMessage) => {
        try {
            const data = await authService.login(user.username, user.password);
            login(data.token, { username: user.username });
            
            if (location.state?.from?.pathname) {
                navigate(location.state.from.pathname);
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setMessage("Login failed.");
        }
    };

    const loginUserFn = (user, setMessage) => {
        handleLogin(user, setMessage);
    };

    return (
        <div>
            <AuthForm title="Login" buttonText="Sign In" auth_fn={loginUserFn} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                No account? Create an account here: <Link to="/register" state={{ from: location.state?.from || location }}>Register</Link>
            </div>
        </div>
    );
}
