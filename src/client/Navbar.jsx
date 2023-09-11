import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser } from './api';

function Navbar() {
    const { isLoggedIn, redirectToLogin, usernameLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const result = await logoutUser(); 
            redirectToLogin();
            navigate('/login');
            toast.info(result.message || 'Logged out successfully.');
        } catch (error) {
            toast.error(error.message || 'Logout failed. Please try again.');
        }
    };

    return (
        <nav className="navbar navbar-dark bg-dark mb-3">
            <div className="container">
                <Link className="navbar-brand" to="/">TRACKR</Link>
                <ul className="navbar-nav ml-auto">
                    {isLoggedIn && (
                        <li className="nav-item">
                            {/* Adding the class 'text-light' to make the text color light */}
                            <span className="text-light">Hello {usernameLoggedIn}&nbsp;</span>
                            <button className="btn btn-danger ml-2" onClick={handleLogout}>Logout</button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
