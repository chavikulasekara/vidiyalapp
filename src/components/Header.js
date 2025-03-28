import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ darkMode, setDarkMode, hideAdmin = false, panelType = 'user' }) => {
  const { language, changeLanguage, t, languages } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`py-4 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {t('header.title')}
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* Language Selector */}
          <div className="relative inline-block text-left">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className={`block appearance-none w-full px-4 py-2 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'} border`}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-4">
            {panelType === 'user' && (
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t('header.home')}
              </Link>
            )}
            {!hideAdmin && panelType === 'user' && (
              <Link to={isAuthenticated ? "/admin" : "/login"} className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t('header.admin')}
              </Link>
            )}
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Logout
              </button>
            )}
          </nav>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            aria-label={darkMode ? t('header.lightMode') : t('header.darkMode')}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;