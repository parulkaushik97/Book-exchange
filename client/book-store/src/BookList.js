import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import './BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBooks = async () => {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await axios.get(`http://localhost:5000/api/books/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);

  useEffect(() => {
    const filteredData = books.filter(book =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.genre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBooks(filteredData);
  }, [search, books]);

  const handleEdit = (book) => {
    navigate(`/edit-book/${book.id}`, { state: { book } });
  };

  const handleDelete = async (bookId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((book) => book.id !== bookId));
      setFilteredBooks(filteredBooks.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const columns = [
    { name: 'Title', selector: row => row.title, sortable: true },
    { name: 'Author', selector: row => row.author, sortable: true },
    { name: 'Genre', selector: row => row.genre, sortable: true },
    { name: 'Condition', selector: row => row.bookcondition, sortable: true },
    { name: 'Availability', selector: row => row.availability, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <button
            onClick={() => handleEdit(row)}
            className="action-btn edit-btn"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="action-btn delete-btn"
          >
            <FaTrash /> Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  if (loading) return <p>Loading books...</p>;

  return (
    <div className="book-list-container">
      <h2>My Books</h2>
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

export default BookList;