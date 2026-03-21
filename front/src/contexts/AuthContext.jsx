import { createContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [isUser, setIsUserState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const hasVerified = useRef(false);

    const setToken = (newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    };

    const setIsUser = () => {
        return new Promise((resolve) => {
            setIsLoading(true);
            if (!token) {
                setIsUserState(false);
                setIsLoading(false);
                resolve(false);
                return;
            }

            authService.verifyToken(token)
                .then(isValid => {
                    setIsUserState(isValid);
                    setIsLoading(false);
                    resolve(isValid);
                })
                .catch(err => {
                    console.error(err);
                    setIsUserState(false);
                    setIsLoading(false);
                    resolve(false);
                });
        });
    };

    // Verify user only once on mount
    useEffect(() => {
        if (!hasVerified.current) {
            hasVerified.current = true;
            setIsUser();
        }
    }, []);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        setIsUserState(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsUserState(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, isUser, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}