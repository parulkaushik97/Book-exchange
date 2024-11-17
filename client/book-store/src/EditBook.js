import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './EditBook.css';  // Assuming you are using a separate CSS file for styles

const EditBook = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { book } = state || {};

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [genre, setGenre] = useState(book?.genre || '');
  const [condition, setCondition] = useState(book?.bookcondition || '');
  const [availability, setAvailability] = useState(book?.availability || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!book) navigate('/book-list'); // Redirect if no book data is passed
  }, [book, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      await axios.put(`http://localhost:5000/api/books/${book.id}`, {
        title,
        author,
        genre,
        condition: condition,
        availability,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('Book updated successfully!');
      setTimeout(() => navigate('/my-books'), 1500); // Redirect after success
    } catch (err) {
      setError('Failed to update book. Please try again.');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Edit Book</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            >
              <option value="">Select Genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Novel">Novel</option>
              <option value="Horror">Horror</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Biography">Biography</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Old">Old</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </div>

          <div className="form-group">
            <label>Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              required
            >
              <option value="">Select Availability</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">Update Book</button>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
