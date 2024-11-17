const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const PORT = 5000;
const jwt_secret = 'mybookstore';
const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;


app.use(cors());
app.use(bodyParser.json());

const nodemailer = require('nodemailer');

// Configure transporter with Gmail SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'test@gmail.com',         // Your Gmail address
    pass: 'xxxx xxxx xxxx xxxx'
  }
});

// Function to send OTP email
const sendOtpEmail = async (recipientEmail, otp) => {
  try {
    // Define the email options
    const mailOptions = {
      from: 'test@gmail.com',         // Sender email
      to: recipientEmail,                   // Recipient email
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bookstore',
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

// Sign up route
app.post('/api/users/signup', (req, res) => {
  const { email, password, confirmPassword, mobileNumber, address } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and include a special character.',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    db.query(
      'INSERT INTO users (email, password, mobile_number, address) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, mobileNumber, address],
      (error, results) => {
        if (error) return res.status(400).json({ error: 'User already exists' });
        res.status(201).json({ message: 'User registered' });
      }
    );
  });
});

// Login route
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error || results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ error: 'Password incorrect' });
      const token = jwt.sign({ id: results[0].id }, jwt_secret, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    });
  });
});

// Protected route
app.get('/dashboard', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  jwt.verify(token, jwt_secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ message: 'Welcome to the dashboard' });
  });
});

// Forgot Password Route - Generate OTP and Save in DB
app.post('/api/users/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the users table
  db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database error while checking email' });
    }

    // If no user is found, return an error
    if (results.length === 0) {
      return res.status(404).json({ error: 'User is not registered' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Insert OTP and expiration time into password_resets table
    db.query(
      'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?',
      [email, otp, expiresAt, otp, expiresAt],
      async (error) => {
        if (error) {
          return res.status(500).json({ error: 'Database error while saving OTP' });
        }

        // Send OTP email
        const emailSent = await sendOtpEmail(email, otp);
        if (emailSent) {
          res.json({ message: 'OTP sent to your email' });
        } else {
          res.status(500).json({ error: 'Failed to send OTP' });
        }
      }
    );
  });
});

// Reset Password Route - Validate OTP and Update Password
app.put('/api/users/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if the OTP is valid and not expired
  db.query(
    'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()',
    [email, otp],
    async (error, results) => {
      if (error || results.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Validate new password against regex
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long and include a special character.',
        });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error) => {
        if (error) return res.status(500).json({ error: 'Failed to update password' });

        // Delete the OTP record after successful password reset
        db.query('DELETE FROM password_resets WHERE email = ?', [email], (error) => {
          if (error) console.error('Error deleting OTP record:', error);
        });

        res.json({ message: 'Password updated successfully' });
      });
    }
  );
});

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;

  const sql = 'SELECT * FROM Users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch username' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to add a book with user_id
app.post('/api/books/add', (req, res) => {
  const { title, author, genre, condition, availability, user_id } = req.body;
  db.query(
    'INSERT INTO books (title, author, genre, bookcondition, availability, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, author, genre, condition, availability, user_id],
    (error, results) => {
      if (error) return res.status(400).json({ error: 'Something is wrong' });
      res.status(201).json({ message: 'Book added successfully' });
    }
  );
});

// Endpoint to get books by user_id
app.get('/api/books/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = 'SELECT * FROM books WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Failed to fetch books:', err);
      res.status(500).json({ error: 'Failed to fetch books' });
    } else {
      res.json(results);
    }
  });
});

app.delete('/api/books/:bookId', (req, res) => {
  const bookId = req.params.bookId;

  const sql = 'DELETE FROM books WHERE id = ?';
  db.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error('Failed to fetch books:', err);
      res.status(500).json({ error: 'Failed to delete book' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint to update book details
app.put('/api/books/:bookId', (req, res) => {
  const bookId = req.params.bookId;
  const { title, author, genre, condition, availability } = req.body;

  // Update query to modify the book's details based on bookId
  const sql = 'UPDATE books SET title = ?, author = ?, genre = ?, bookcondition = ?, availability = ? WHERE id = ?';

  db.query(sql, [title, author, genre, condition, availability, bookId], (err, results) => {
    if (err) {
      console.error('Failed to update book:', err);
      return res.status(500).json({ error: 'Failed to update book' });
    }

    // Check if any rows were affected (if results.affectedRows > 0)
    if (results.affectedRows > 0) {
      res.json({ message: 'Book updated successfully' });
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  });
});

app.get('/api/books/search', (req, res) => {
  const { query, user_id } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchQuery = `
    SELECT * 
    FROM books 
    WHERE (title LIKE ? 
      OR author LIKE ? 
      OR genre LIKE ?) AND user_id <> ?`;

  const searchValue = `%${query}%`;

  db.query(searchQuery, [searchValue, searchValue, searchValue, user_id], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }

    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
