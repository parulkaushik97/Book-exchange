import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode to decode the token
import './BookList.css';

const ResultsPage = () => {
  const { query } = useParams();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        // Get the token from local storage
        const token = localStorage.getItem('token');
        let userId = null;

        // Decode the token to get the user ID
        if (token) {
          const decodedToken = jwtDecode(token);
          userId = decodedToken.id;
        }

        // Make the API request with the user ID and query
        const response = await axios.get(`http://localhost:5000/api/books/search`, {
          params: { query, user_id: userId }, // Send query and user_id as query parameters
        });

        setBooks(response.data);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results.');
      }
    };

    fetchSearchResults();
  }, [query]);

  useEffect(() => {
    const filteredData = books.filter(book =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.genre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBooks(filteredData);
  }, [search, books]);

  const columns = [
    { name: 'Title', selector: row => row.title, sortable: true },
    { name: 'Author', selector: row => row.author, sortable: true },
    { name: 'Genre', selector: row => row.genre, sortable: true },
    { name: 'Condition', selector: row => row.bookcondition, sortable: true },
    { name: 'Availability', selector: row => row.availability, sortable: true },
  ];

  return (
    <div className="book-list-container">
      <h1>Search Results for "{query}"</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by title, author, or genre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      {filteredBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredBooks}
          pagination
          highlightOnHover
          responsive
          className="book-table"
        />
      )}
    </div>
  );
};

export default ResultsPage;