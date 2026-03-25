import {Link} from "react-router-dom";
import icon from "../resources/images/iconeV1.png";

export default function HomePage() {
  return (
    <div className="pageContainer">
        <header>
            <img className="logo" src={icon} title="une image mims a changer"/>
            <h1>Welcome to the Game</h1>
        </header>

        <main className="content">
            <Link to="game"> <button className="grosBouton">Jouer</button> </Link>
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
