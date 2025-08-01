import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import DoctorList from './components/DoctorList';
import DoctorProfile from './components/DoctorProfile';
import MyAppointments from './components/MyAppointments';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<DoctorList />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/appointments" element={<MyAppointments />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2025 NirogGyan. All rights reserved.</p>
                <p className="mt-2 text-sm">Connecting you with quality healthcare providers.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;