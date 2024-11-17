// src/components/ResetPassword.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Retrieve email from session storage
        const storedEmail = sessionStorage.getItem('resetEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            setError('No email provided for reset.');
        }
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.put('http://localhost:5000/api/users/reset-password', {
                email,
                otp,
                newPassword,
            });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response.data.error || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="container">
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
                <div className="form-group">
                    <label>Enter OTP</label>
                    <input
                        type="text"
                        className="form-control"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Reset Password</button>
            </form>
            {message && <div className="alert alert-success mt-3">{message}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
};

export default ResetPassword;