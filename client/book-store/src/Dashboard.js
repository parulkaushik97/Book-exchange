import React, { useState, useEffect } from 'react';
import axios from 'axios';  // Import axios
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [condition, setCondition] = useState('');
  const [availability, setAvailability] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve and decode the token from local storage
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken)
      setUser(decodedToken); // Save decoded token info to user state
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const bookData = {
      title,
      author,
      genre,
      condition,
      availability,
      user_id: user?.id
    };

    // Replacing fetch with axios.post
    axios
      .post('http://localhost:5000/api/books/add', bookData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const data = response.data;
        if (data.error) {
          setError(data.error);
          setMessage('');
        } else {
          setMessage('Book added successfully!');
          setError('');
          // Clear the form on successful submission
          setTitle('');
          setAuthor('');
          setGenre('');
          setCondition('');
          setAvailability('');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setError('Failed to add book');
        setMessage('');
      });
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a search query.');
      return;
    }
    if (searchQuery.trim().length < 3) {
      alert('Please enter at least 3 letters');
      return;
    }
    navigate(`/search/${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-actions">
          <div className="search-container">
          <input
            type="text"
            placeholder="Search books by others"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
          </div>
        </div>

        <div className='form-wrapper'>
          <div className="form-container">
            <h2>Add New Book</h2>

            {/* Success/Error Messages */}
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
                <label>Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  required>
                  <option value="">Select Availability</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;