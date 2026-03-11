import Auth from './Auth';

export default function Login() {
    
    function loginUser(user, login, setMessage) {
        fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: user.username,
                password: user.password
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Login failed");
            }
            return res.json();
        })
        .then(data => {
            login(data.token, { username: user.username });
            setMessage("Logged in! Token: " + data.token);
        })
        .catch(err => {
            console.error(err);
            setMessage("Login failed: " + err.message);
        });
    }

    return <Auth title="Login" buttonText="Sign In" auth_fn={loginUser} />;
}