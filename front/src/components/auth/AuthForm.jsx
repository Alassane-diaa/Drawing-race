import { useState } from "react";

export default function AuthForm({ title, buttonText, auth_fn }) {
    const [user, setUser] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");

    const setMessageFn = (msg) => setMessage(msg);
    
    // auth_fn expects (user, login, setMessage)
    // but we're now passing login directly in the page component
    // so we need to adapt this
    const handleSubmit = () => {
        auth_fn(user, null, setMessageFn);
    };

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
            <button onClick={handleSubmit}>
                {buttonText}
            </button>
            <div>{message}</div>
        </div>
    );
}
