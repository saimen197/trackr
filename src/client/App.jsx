import React from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, Outlet } from 'react-router-dom';
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
import { BeatLoader } from 'react-spinners';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/app.css';

//Show spinner when loading app
const spinnerPlaceholder = document.getElementById('spinner-placeholder');
if (spinnerPlaceholder) {
    ReactDOM.render(<BeatLoader />, spinnerPlaceholder);
}

//deny access to certain components whenn not logged in
function ProtectedLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
      return <div className="login-prompt">Please <a href="/login">login</a> to access this content.</div>;
  }

  return <Outlet />;
}

const App = () => {
  //stop showing the initial loader
  const loader = document.getElementById('initial-loader');
  if (loader) {
      loader.style.display = 'none';
  }
  
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
          <Route path='/register' element={<Register />} />

          <Route path='/' element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path='main' element={<MainComponent />} />
            <Route path='ingredient' element={<IngredientCreation />} />
            <Route path='meal' element={<MealCreation />} />
          </Route>

          <Route
            key="notFound"
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
  );
};

export default App;