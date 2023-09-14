import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainComponent from './MainComponent';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/main');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div>
      <h1>TRACKR</h1>
      <div>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>     
    </div>
  );
};

export default Home;