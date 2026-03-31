import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import { authService } from '../services/authService';
import './LoginPage.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const handleRegister = async (user, setMessage) => {
        try {
            const data = await authService.register(user.username, user.password);
            login(data.token, { username: user.username });
            
            if (location.state?.from?.pathname) {
                navigate(location.state.from.pathname, { state: { from: location.state.from } });
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            setMessage("Registration failed.");
        }
    };

    const registerUserFn = (user, setMessage) => {
        handleRegister(user, setMessage);
    };

    return (
        <div className="wrapper">
            <div className="card">
                <AuthForm title="Create Account" buttonText="Register" auth_fn={registerUserFn} />
            </div>
            <div className="footer">
                Already have an account? Login here: <Link to="/login" state={{ from: location.state?.from || location }}>Sign In</Link>
            </div>
        </div>
    );
}
