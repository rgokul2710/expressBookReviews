const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body; 
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users[username]) {
      return res.status(400).json({ message: `Username '${username}' already exists` });
    }
    users[username] = {
      username: username,
      password: password, 
    };
    res.status(201).json({ message: `User '${username}' registered successfully` });
  });

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    const bookList = await new Promise(resolve => resolve(Object.values(books)));
    const bookListString = JSON.stringify(bookList, null, 2); 
    res.send(bookListString);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  const book = await new Promise(resolve => resolve(books[isbn])); 
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const authorName = req.params.author.toLowerCase();  
    const booksByAuthor = await new Promise(resolve => {
        const booksList = Object.keys(books)
          .map(isbn => books[isbn])
          .filter(book => book.author.toLowerCase() === authorName);
        resolve(booksList); 
      });
    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor); 
    } else {
      res.status(404).json({ message: `No books found by author ${authorName}` });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const titleName = req.params.title.toLowerCase();
    const booksByTitle = await new Promise(resolve => {
        const booksList = Object.keys(books)
          .map(isbn => books[isbn])
          .filter(book => book.title.toLowerCase() === titleName);
        resolve(booksList); 
      });
  if (booksByTitle.length > 0) {
    res.json(booksByTitle);
  } else {
    res.status(404).json({ message: `No books found with title '${titleName}'` });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn]; 
    if (book) {
      if (Object.keys(book.reviews).length > 0) {
        res.json(book.reviews);
      } else {
        res.status(404).json({ message: `No reviews found for book with ISBN ${isbn}` });
      }
    } else {
      res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
