import { useState, useEffect } from 'react';
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import ProtectedRoutes from './components/auth/ProtectedRoutes';
import LanguageSplash from './components/LanguageSplash';
import SuperAdmin from './components/functions/superadmin/SuperAdmin';
import { useSelector } from 'react-redux';

function App() {
  const { user } = useSelector(state => state.auth);
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
        
        {}
        <Route path="/superadmin" element={
          user?.rol === 'superadmin' ? <SuperAdmin /> : <Navigate to="/" />
        } />

        <Route element={<ProtectedRoutes />}>
          <Route path="/*" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App




