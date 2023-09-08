import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
                setUserId(response.user.id); // Assuming the user object has an 'id' property
                setUsernameLoggedIn(response.user.username);
                setIsLoggedIn(true);
                setNeedsRedirect(false);
                toast.success("Logged in successfully!");
                navigate('/main');
            } else {
                // This is a safety net in case the response doesn't contain the user but this scenario shouldn't really occur unless there's an unexpected server behavior
                throw new Error("Unexpected server response");
            }
        } catch (error) {
            // Handle any error that occurred during the login
            toast.error(error.message || "Login failed. Please try again.");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
