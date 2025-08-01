import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NirogGyan</h1>
                <p className="text-xs text-gray-500">Healthcare at your fingertips</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Find Doctors
            </Link>
            <Link
              to="/appointments"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === '/appointments' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              My Appointments
            </Link>
            <Link
              to="/admin"
              className={`font-medium transition-colors duration-200 ${
                location.pathname === '/admin' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;