import './App.css'
import {Link} from "react-router-dom";

export default function App() {
  return (
    <div className="pageContainer">
        <header>
            <img className="logo" src="iconeV1.png" title="une image mims a changer"/>
            <h1>Welcome to the Game</h1>
        </header>

        <main className="content">
            <Link to="game"> <button className="grosBouton">Jouer</button> </Link>

        </main>

        {/*mettre dans nav*/}
        <footer>
            <h2>Projet Advanced Software Engineering</h2>
        </footer>
    </div>
  )
}
