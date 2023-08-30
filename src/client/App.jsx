import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import Layout from './Layout';
import Home from './components/Home';
import MainComponent from './components/MainComponent'; 
import IngredientCreation from './components/IngredientCreation';
import MealCreation from './components/MealCreation';
import Login from './components/Login';
import Register from './components/Register';
import { MealProvider } from '/src/client/context/MealContext.jsx';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <ToastContainer 
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <MealProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/main' element={<MainComponent />} />
            <Route path='/ingredient' element={<IngredientCreation />} />
            <Route path='/meal' element={<MealCreation />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='*'
              element={
                <div style={{ padding: '1rem' }}>
                  <p>There&apos;s nothing here!</p>
                </div>
              }
            />
          </Routes>
          </MealProvider>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
