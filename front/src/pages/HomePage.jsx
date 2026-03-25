import {Link} from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const [difficulty, setDifficulty] = useState("medium");
    const navigate = useNavigate();

    const handleStartGame = () => {
    navigate("/game", { state: { difficulty } });
    };
  return (
    <div className="pageContainer">
        <header>
            <img className="logo" src="iconeV1.png" title="une image mims a changer"/>
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
                <Link to="login"> <button>Se connecter</button> </Link>
                <Link to="register"> <button>Créer un compte</button> </Link>
            </div>
        </main>
        

        <nav className= "footer">
            <h2>Projet Advanced Software Engineering</h2>
        </nav>
    </div>
  )
}
