import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function StatsPage() {
    const { user, isUser } = useAuth();
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        if (!isUser) {
            setMessage('Login first');
        } else {
            setMessage('Welcome ' + user.username);
        }
    }, [isUser, user]);
    
    return (
        <div className="stats">
            <h1>Stats</h1>
            <div>{message}</div>
        </div>
    );
}
