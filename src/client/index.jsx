import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';  // Import the App component
import { AppProvider } from './context/AppProvider'

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <App /> 
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('contents')
);