import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>
        {children} {/* This is where your routed components will render */}
      </main>      
    </div>
  );
};

export default Layout;
