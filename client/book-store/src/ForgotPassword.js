// src/components/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
            setMessage(response.data.message);

            // Store email in session storage
            sessionStorage.setItem('resetEmail', email);

            // Redirect to the reset password page
            window.location.href = '/reset-password';
        } catch (err) {
            setError(err.response.data.error || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="container">
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                    <label>Enter Email Id</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Send OTP</button>
            </form>

            {/* Success message */}
            {message && (
                <div className="alert alert-success mt-4" role="alert">
                    <strong>Success:</strong> {message}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="alert alert-danger mt-4" role="alert">
                    <strong>Error:</strong> {error}
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;