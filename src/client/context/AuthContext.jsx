import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { checkAuthStatus } from '../api';
import { BeatLoader } from 'react-spinners';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [usernameLoggedIn, setUsernameLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const response = await checkAuthStatus(); 
        setUser(response.user)
        setUserId(response.user.id);
        setUsernameLoggedIn(response.user.username);
        setIsLoggedIn(true);
        setLoading(false);
        setHasCheckedAuth(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setHasCheckedAuth(true);  
        setLoading(false);
        setIsLoggedIn(false);
        navigate('/login'); 
      }
    };
    checkUserAuthentication();
  }, [navigate]); 

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoggedIn, 
      setIsLoggedIn, 
      userId, 
      setUserId, 
      usernameLoggedIn, 
      setUsernameLoggedIn, 
      hasCheckedAuth }}>
      
      {isLoading ? 
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'black' }}>
          <BeatLoader color={"#123abc"} />
        </div> : 
        children
      }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
