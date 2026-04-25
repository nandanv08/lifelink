/**
 * LifeLink - Main App Component
 * Handles routing and layout structure with role-based routing
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import Home from './pages/Home';
import Donors from './pages/Donors';
import Register from './pages/Register';
import Emergency from './pages/Emergency';
import Requests from './pages/Requests';
import Admin from './pages/Admin';
import About from './pages/About';
import Login from './pages/Login';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donors" element={<Donors />} />
            <Route path="/register" element={<Register />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DonorDashboard />} />
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="*" element={
              <div className="empty-state page-enter">
                <div className="empty-state-icon">🔍</div>
                <h3>Page Not Found</h3>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
