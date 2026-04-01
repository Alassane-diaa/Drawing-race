import {Link} from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import icon from "../resources/images/iconeV1.png";
import './HomePage.css'

export default function HomePage() {
    const [difficulty, setDifficulty] = useState("medium");
    const navigate = useNavigate();
    const { isUser, user, logout } = useAuth();

    const handleStartGame = () => {
    navigate("/solo/game", { state: { difficulty } });
    };

    const difficultyLabel = difficulty === 'easy'
        ? 'Easy'
        : difficulty === 'medium'
        ? 'Medium'
        : 'Hard';

  return (
    <div className="race-lobby">
        <header className="race-hero">
            <img className="race-logo" src={icon} title="Logo du jeu"/>
            <div>
                <p className="eyebrow">Advanced Software Engineering Project</p>
                <h1>Draw fast. Guess right. Win rounds.</h1>
                <p className="hero-copy">A quick drawing game where your sketch impacts the result: practice in solo, compete in multiplayer.</p>

            </div>
        </header>

        <section className="race-difficulty">
            <h3>Choose difficulty</h3>
            <div className="difficulty-row">
                {['easy', 'medium', 'hard'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`difficulty-chip ${difficulty === level ? 'active' : ''}`}
                    >
                        {level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard'}
                    </button>
                ))}
            </div>
        </section>

        <main className="race-actions">
            <button className="start-race-btn" onClick={handleStartGame}>Start solo game</button>

            <div className="secondary-actions">
                {!isUser && <Link to="/login"><button>Log in</button></Link>}
                {!isUser && <Link to="/register"><button>Create account</button></Link>}
                <Link to="/play"><button>Multiplayer</button></Link>
                {isUser && <Link to="/stats"><button>Stats</button></Link>}
                {isUser && <button onClick={logout}>Log out</button>}
            </div>

            {isUser && user?.username && <p className="connected-label">Signed in as: {user.username}</p>}
        </main>

        <footer className="race-footer">
            <span>ASE Project</span>
            <span>Real-time drawing and prediction game</span>
        </footer>
    </div>
  )
}
