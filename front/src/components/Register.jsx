import Auth from './Auth';

export default function Register() {
    
    function registerUser(user, login, setMessage) {
        fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.username,
                password: user.password
            })
        })
        .then(res => res.json())
        .then(data => {
            login(data.token, { username: user.username });
            setMessage("Registered! Token: " + data.token);
        })
        .catch(err => {
            console.error(err);
            setMessage("Registration failed");
        });
    }

    return <Auth title="Create Account" buttonText="Register" auth_fn={registerUser} />;
}