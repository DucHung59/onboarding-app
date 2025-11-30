import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import ProtectedRoute from './components/protectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={
        <ProtectedRoute>
          <About />
        </ProtectedRoute>
        } />
      <Route path='/login' element={<Login/>}/>
    </Routes>
  );
}

export default App;
