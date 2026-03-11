import { useEffect, useState, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';


export default function Register() {
    const { login, setToken } = useAuth();
    const [user, setUser] = useState({"username": null, "password": null});
    const [registerLog, setRegisterLog] = useState("")


    function register() {
        fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user["username"],
                password: user["password"]
            })
        })
            .then(res => res.json())
            .then(data => {
                setRegisterLog("Registered!\nToken:\n" + data.token);  
                login(data.token, { username: user["username"] });                  
            })
            .catch(err => 
                {console.error(err);
                    setRegisterLog("Impossible de créer un compte pour le moment, veuillez nous en excuser."); 
                });
            
    }

    return (
        <div>
            Créer un compte 
            <input 
                id="regUsername" 
                placeholder="Username"
                value={user["username"] || ""}
                onChange={(e) => setUser({...user, username: e.target.value})}
            />

            <input 
                id="regPassword" 
                type="password" 
                placeholder="Password"
                value={user["password"] || ""}
                onChange={(e) => setUser({...user, password: e.target.value})}
            />
            <button onClick={register}>Register</button>
            <div>{registerLog}</div>
        </div>
    )
}
