import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isUser, user, logout } = useAuth();

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="topNavbar">
            <div className="navBrand">
                <NavLink to="/home" onClick={closeMenu}>Drawing Race</NavLink>
            </div>

            <button
                type="button"
                className="menuToggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`navLinks ${isOpen ? 'open' : ''}`}>
                <NavLink to="/home" onClick={closeMenu}>Accueil</NavLink>
                <NavLink to="/solo/game" onClick={closeMenu}>Solo</NavLink>
                <NavLink to="/play" onClick={closeMenu}>Multijoueur</NavLink>
                <NavLink to="/doc" onClick={closeMenu}>Doc</NavLink>

                {isUser && (
                    <NavLink to="/stats" onClick={closeMenu}>Stats</NavLink>
                )}

                {!isUser && (
                    <>
                        <NavLink to="/login" onClick={closeMenu}>Connexion</NavLink>
                        <NavLink to="/register" onClick={closeMenu}>Inscription</NavLink>
                    </>
                )}

                {isUser && (
                    <button
                        type="button"
                        className="logoutBtn"
                        onClick={() => {
                            logout();
                            closeMenu();
                        }}
                    >
                        Deconnexion
                    </button>
                )}
            </div>

            {isUser && user?.username && (
                <div className="userBadge">{user.username}</div>
            )}
        </nav>
    );
}
