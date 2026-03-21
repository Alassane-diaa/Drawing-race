import { useAuth } from '../contexts/AuthContext';
import { useState } from "react";

export default function Stats() {
    
    const { user, isUser, setIsUser } = useAuth();
    const [message, setMessage] = useState("");

    async function changeMessage() {
        const isAuthenticated = await setIsUser();
        if (!isAuthenticated) {
            setMessage("Login first");
            return;
        } else {
            setMessage("Welcome " + user.username)
        }
    }
    return (
        <div className="stats">
            <h1>Stats</h1>
            <button onClick={() => changeMessage()}>
                {"Click to check auth"}
            </button>
            <div>{message}</div>
        </div>
    )
}