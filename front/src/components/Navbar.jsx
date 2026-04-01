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
                <NavLink to="/home" onClick={closeMenu}>Drawing race</NavLink>
            </div>

            <button
                type="button"
                className="menuToggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Open or close navigation menu"
                aria-expanded={isOpen}
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`navLinks ${isOpen ? 'open' : ''}`}>
                <NavLink to="/home" onClick={closeMenu}>Home</NavLink>
                <NavLink to="/solo/game" onClick={closeMenu}>Solo</NavLink>
                <NavLink to="/play" onClick={closeMenu}>Multiplayer</NavLink>
                <NavLink to="/doc" onClick={closeMenu}>Docs</NavLink>

                {isUser && (
                    <NavLink to="/stats" onClick={closeMenu}>Stats</NavLink>
                )}

                {!isUser && (
                    <>
                        <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                        <NavLink to="/register" onClick={closeMenu}>Register</NavLink>
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
                        Log out
                    </button>
                )}
            </div>

            {isUser && user?.username && (
                <div className="userBadge">{user.username}</div>
            )}
        </nav>
    );
}
