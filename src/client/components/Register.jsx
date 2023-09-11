import React, { useState } from 'react';
import { registerUser } from '../api';
import { toast } from 'react-toastify';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            setLoading(true);
            
            const userData = { username, password, email };
            const response = await registerUser(userData);
            if (response) {
                toast.success('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (error) {
            toast.error(`Error during registration: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark-theme">
            <h2 className="text-light">Register</h2>
            <input 
                className="dark-input form-control" // Use Bootstrap's form-control class for consistency
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                className="dark-input form-control"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                className="dark-input form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                Register
            </button>
            {loading && <BeatLoader />}
        </div>
    );
}

export default Register;
