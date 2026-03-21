import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import { authService } from '../services/authService';

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const handleRegister = async (user, setMessage) => {
        try {
            const data = await authService.register(user.username, user.password);
            login(data.token, { username: user.username });
            setMessage("Registered! Token: " + data.token);
            
            // Navigate back to previous page (e.g., /login or /stats) while preserving state
            if (location.state?.from?.pathname) {
                navigate(location.state.from.pathname, { state: { from: location.state.from } });
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setMessage("Registration failed");
        }
    };

    const registerUserFn = (user, login, setMessage) => {
        handleRegister(user, setMessage);
    };

    return (
        <div>
            <AuthForm title="Create Account" buttonText="Register" auth_fn={registerUserFn} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account? Login here: <Link to="/login" state={{ from: location.state?.from || location }}>Sign In</Link>
            </div>
        </div>
    );
}
