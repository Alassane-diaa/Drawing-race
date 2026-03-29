import {Link} from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import icon from "../resources/images/iconeV1.png";

export default function HomePage() {
    const [difficulty, setDifficulty] = useState("medium");
    const navigate = useNavigate();
    const { isUser, user, logout } = useAuth();

    const handleStartGame = () => {
    navigate("/game", { state: { difficulty } });
    };
  return (
    <div className="pageContainer">
        <header>
            <img className="logo" src={icon} title="une image mims a changer"/>
            <h1>Welcome to the Game</h1>
        </header>

        <div className="difficulty-selector">
            <h3>Select Difficulty :</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
                {['easy', 'medium', 'hard'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: difficulty === level ? '#4CAF50' : '#ddd',
                            color: difficulty === level ? 'white' : 'black',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        <main className="content">
            {/* Navigate au lieu de Link pour envoyer difficulté */}
            <button className="grosBouton" onClick={handleStartGame}>Play</button>
            <div>
                {!isUser && <Link to="login"> <button>Se connecter</button> </Link>}
                {!isUser && <Link to="register"> <button>Créer un compte</button> </Link>}
                <Link to="play"> <button>Multiplayer</button> </Link>
                {isUser && <Link to="stats"> <button>Stats</button> </Link>}
                {isUser && <button onClick={logout}>Se déconnecter</button>}
            </div>
            {isUser && user?.username && <p>Connecté: {user.username}</p>}
        </main>
        

        <nav className= "footer">
            <h3>Projet Advanced Software Engineering</h3>
        </nav>
    </div>
  )
}
