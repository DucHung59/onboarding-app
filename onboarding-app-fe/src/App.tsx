import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import ProtectedRoute from './components/protectedRoute';
import { initGA4, logPageViewGA4 } from './utils/analystic';

function App() {
  const location = useLocation();

  // Khởi tạo GA4 khi app chạy
  useEffect(() => {
    initGA4();
  }, []);

  // Track page view mỗi khi location thay đổi
  useEffect(() => {
    logPageViewGA4(location.pathname + location.search);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
