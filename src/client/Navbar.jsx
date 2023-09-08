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
    // Send the refresh token to invalidate it server-side
    const result = await logoutUser(); // replace with where you're storing the refresh token

    // Clear authentication-related states
    redirectToLogin();

    // Redirect to login page
    navigate('/login');

    // Display logout notification
    toast.info(result.message || 'Logged out successfully.');

  } catch (error) {
    // Handle any errors that occurred during logout
    toast.error(error.message || 'Logout failed. Please try again.');
  }
};


  return (
    <nav className="navbar">
      <ul>
        {/*<li><Link to="/">Home</Link></li>
          <li><Link to="/main">Main</Link></li>
          <li><Link to="/ingredient">Create Ingredient</Link></li>
          <li><Link to="/meal">Create Meal</Link></li>
          <li><Link to="/analysis">Analysis</Link></li>
         Conditionally render the Logout button if the user is logged in */}
        {isLoggedIn && <li> Hello {usernameLoggedIn} <button onClick={handleLogout}>Logout</button></li>}
      </ul>
    </nav>
  );
}

export default Navbar;
