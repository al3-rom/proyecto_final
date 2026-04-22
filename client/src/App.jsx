import { useState, useEffect } from 'react';
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import ProtectedRoutes from './components/auth/ProtectedRoutes';
import LanguageSplash from './components/LanguageSplash';


function App() {
  const [showSplash, setShowSplash] = useState(
    () => !localStorage.getItem('languageSelected')
  );

  if (showSplash) {
    return <LanguageSplash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
