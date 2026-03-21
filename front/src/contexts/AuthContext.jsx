import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setTokenState] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [isUser, setIsUserState] = useState(false);

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
            if (!token) {
                setIsUserState(false);
                resolve(false);
                return;
            }

            fetch("http://localhost:8080/test", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
                .then(res => {
                    const isValid = res.ok;
                    setIsUserState(isValid);
                    resolve(isValid);
                })
                .catch(err => {
                    console.error(err);
                    setIsUserState(false);
                    resolve(false);
                });
        });
    };

    // Verify user on mount or when token changes
    useEffect(() => {
        setIsUser();
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsUserState(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, isUser, login, logout, setToken, setIsUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}