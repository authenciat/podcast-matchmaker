import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Podcast Matchmaker</h1>
            <nav className="flex space-x-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                }
                end
              >
                Home
              </NavLink>
              <NavLink 
                to="/search" 
                className={({ isActive }) => 
                  isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                }
              >
                Search
              </NavLink>
              <NavLink 
                to="/favorites" 
                className={({ isActive }) => 
                  isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                }
              >
                Favorites
              </NavLink>
              <NavLink 
                to="/recommendations" 
                className={({ isActive }) => 
                  isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                }
              >
                Recommendations
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      
      <footer className="bg-blue-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Podcast Matchmaker - Powered by NLP</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 