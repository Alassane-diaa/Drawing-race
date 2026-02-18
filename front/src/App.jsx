import './App.css'

export default function App() {
  return (
    <div className="pageContainer">
        <header>
            <img className="logo" src="iconeV1.png" title="une image mims a changer"/>
            <h1>Welcome to the Home Page</h1>
        </header>

        <main className="content">
            <button className="grosBouton">Jouer</button>
        </main>

        {/*mettre dans nav*/}
        <footer>
            <h2>Projet Advanced Software Engineering</h2>
        </footer>
    </div>
  )
}

