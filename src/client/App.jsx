import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Layout from './Layout';
import Home from './components/Home';
import MainComponent from './components/MainComponent';
import IngredientCreation from './components/IngredientCreation';
import MealCreation from './components/MealCreation';
import Login from './components/Login';
import Register from './components/Register';
import { MealProvider } from '/src/client/context/MealContext.jsx';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/app.css';


function requireAuth(Component) {
  return function ProtectedComponent(props) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoggedIn) {
        navigate('/login');
      }
    }, [isLoggedIn, navigate]);

    if (isLoggedIn) {
      return <Component {...props} />;
    } else {
      return null;
    }
  }
}

const ProtectedHome = requireAuth(Home);
const ProtectedMainComponent = requireAuth(MainComponent);
const ProtectedIngredientCreation = requireAuth(IngredientCreation);
const ProtectedMealCreation = requireAuth(MealCreation);

const protectedRoutes = [
  <Route key="home" path='/' element={<ProtectedHome />} />,
  <Route key="main" path='/main' element={<ProtectedMainComponent />} />,
  <Route key="ingredient" path='/ingredient' element={<ProtectedIngredientCreation />} />,
  <Route key="meal" path='/meal' element={<ProtectedMealCreation />} />,
  <Route key="register" path='/register' element={<Register />} />
];

const App = () => {
  return (
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
          <Route path='/login' element={<Login />} />
          <Route
            key="notFound"
            path='*'
            element={
              <div style={{ padding: '1rem' }}>
                <p>There&apos;s nothing here!</p>
              </div>
            }
          />
          {protectedRoutes}
        </Routes>
      </MealProvider>
    </Layout>
  );
};

export default App;
