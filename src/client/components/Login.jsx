import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../api';

function Login() {
    const { setUserId, setIsLoggedIn, setNeedsRedirect, setUsernameLoggedIn } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            console.log(username, password);
            const response = await loginUser({ username, password });
            console.log(response);
            if (response && response.user) {
                setUserId(response.user.id);
                setUsernameLoggedIn(response.user.username);
                setIsLoggedIn(true);
                //setNeedsRedirect(false);
                toast.success("Logged in successfully!");
                navigate('/main');
            } else {
                throw new Error("Unexpected server response");
            }
        } catch (error) {
            toast.error(error.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="dark-theme">
            <h2 className="text-light">Login</h2>
            <input 
                className="dark-input form-control"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                className="dark-input form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-primary" onClick={handleLogin}>Login</button>
                <Link className="text-light" to="/register">No account yet?</Link>
            </div>
        </div>
    );

}

export default Login;
