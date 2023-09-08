import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';  // Import the App component
import { AuthProvider } from './context/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App /> 
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('contents')
);