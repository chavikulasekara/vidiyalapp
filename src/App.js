import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initEmailJS } from './services/emailInit';

// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// We're not using Firebase Storage to avoid paid plans

// Components
import FeedbackForm from './components/FeedbackForm';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

// Contexts
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARfJOeA4eDEfMvJDT-IlbRAJDwL1F_Kck",
  authDomain: "masapp-6937c.firebaseapp.com",
  projectId: "masapp-6937c",
  storageBucket: "masapp-6937c.appspot.com",
  messagingSenderId: "280277668872",
  appId: "1:280277668872:web:1515ddcecb5c7c5c4dedbd",
  measurementId: "G-66EJZLYJTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Not using storage to avoid paid plans

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // Get environment variables
  const panelType = process.env.REACT_APP_PANEL_TYPE || 'user';
  const hideAdmin = process.env.REACT_APP_HIDE_ADMIN === 'true';
  const appTitle = process.env.REACT_APP_TITLE || 'Restroom Cleanliness Feedback System';

  // Set document title
  useEffect(() => {
    document.title = appTitle;
    
    // Initialize EmailJS
    initEmailJS();
  }, [appTitle]);

  // Check for user's preferred color scheme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Listen for changes in color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      setDarkMode(e.matches);
    });
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            hideAdmin={hideAdmin}
            panelType={panelType}
          />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {panelType === 'user' && (
                <Route path="/" element={<FeedbackForm db={db} />} />
              )}
              {/* Login route */}
              <Route path="/login" element={<Login />} />
              {/* Protected admin route */}
              {(panelType === 'admin' || !hideAdmin) && (
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminPanel db={db} darkMode={darkMode} />
                  </PrivateRoute>
                } />
              )}
            </Routes>
          </main>
          <ToastContainer position="bottom-right" theme={darkMode ? 'dark' : 'light'} />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
export { db }; // Only exporting db as we're not using storage