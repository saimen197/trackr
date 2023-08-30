import React, { useState } from 'react';
import { registerUser } from '../api';  // Import the function
import { toast } from 'react-toastify';  // Import the toast function
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
                // Show a success message
                toast.success('Registration successful! Redirecting to login...');

                // Optionally redirect to login page after a short delay
                setTimeout(() => {
                    // Assuming you're using react-router, you can use the useHistory hook to programmatically navigate
                    // Add this at the top of your component: const history = useHistory();
                    navigate('/login');
                }, 1500);  // Delay of 1.5 seconds
            }
        } catch (error) {
            // Show an error message
            toast.error(`Error during registration: ${error.message}`);
        } finally {
            setLoading(false);  // Stop loading
        }
    };


    return (
        <div>
            <h2>Register</h2>
            <input 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister} disabled={loading}>
                Register
            </button>
            {loading && <BeatLoader />}
        </div>
    );
}

export default Register;
