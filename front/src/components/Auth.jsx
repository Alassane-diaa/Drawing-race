import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

export default function Auth({ title, buttonText, auth_fn }) {
    const { login } = useAuth();
    const [user, setUser] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");

    return (
        <div>
            <h2>{title}</h2>
            <input 
                placeholder="Username"
                value={user.username}
                onChange={(e) => setUser({...user, username: e.target.value})}
            />
            <input 
                type="password" 
                placeholder="Password"
                value={user.password}
                onChange={(e) => setUser({...user, password: e.target.value})}
            />
            <button onClick={() => auth_fn(user, login, setMessage)}>
                {buttonText}
            </button>
            <div>{message}</div>
        </div>
    );
}