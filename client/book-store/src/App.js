import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import BookList from './BookList';
import EditBook from './EditBook';
import ResultsPage from './ResultsPage';

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // Check if user is logged in
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      {/* Navbar appears on every page */}
      <Navbar />
      <div className="content">

        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-books" element={<BookList/>} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/search/:query" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;