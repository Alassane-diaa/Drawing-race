import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import './StatsPage.css';

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
        <div className="stats-page">
            <section className="stats-head">
                <h1>Stats</h1>
                <p>{message}</p>
            </section>

            <section className="stats-grid">
                <article>
                    <h3>Games</h3>
                    <div className="stat-value">-</div>
                </article>
                <article>
                    <h3>Winrate</h3>
                    <div className="stat-value">-</div>
                </article>
                <article>
                    <h3>Best score</h3>
                    <div className="stat-value">-</div>
                </article>
            </section>

            <section className="stats-note">
                Detailed statistics will appear here once backend data integration is complete.
            </section>
        </div>
    );
}
