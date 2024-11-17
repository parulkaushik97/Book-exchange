import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [formError, setFormError] = useState('');

  const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10}$/;

  // Validating the password
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password must be at least 8 characters long and contain a special character.');
    } else {
      setPasswordError('');
    }
  };

  // Validating the email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  // Validating the mobile number
  const handleMobileChange = (e) => {
    const newMobile = e.target.value;
    setMobileNumber(newMobile);
    if (!mobileRegex.test(newMobile)) {
      setMobileError('Mobile number must be 10 digits.');
    } else {
      setMobileError('');
    }
  };

  // Check if the form is valid
  const isFormValid = () => {
    return (
      email &&
      password &&
      confirmPassword &&
      mobileNumber &&
      address &&
      password === confirmPassword &&
      !passwordError &&
      !emailError &&
      !mobileError
    );
  };

  // Handle form submission
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return alert('Passwords do not match');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/signup', {
        email,
        password,
        confirmPassword,
        mobileNumber,
        address,
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="container">
      <h2>Create an Account</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailChange} 
        required
      />
      {emailError && <p className="error">{emailError}</p>}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordChange} 
        required
      />
      {passwordError && <p className="error">{passwordError}</p>}

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
      />
      {confirmPassword && password !== confirmPassword && (
        <p className="error">Passwords do not match.</p>
      )}

      <input
        type="text"
        placeholder="Mobile Number"
        value={mobileNumber}
        onChange={handleMobileChange}
        onBlur={handleMobileChange}
        required
      />
      {mobileError && <p className="error">{mobileError}</p>}

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />

      {formError && <p className="error">{formError}</p>}

      <button onClick={handleSignup} disabled={!isFormValid()}>
        Signup
      </button>
    </div>
  );
}

export default Signup;