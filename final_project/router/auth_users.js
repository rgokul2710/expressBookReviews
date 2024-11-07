const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return username && username.trim().length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const user = users[username];
    return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: `Username '${username}' is invalid` });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username }, 'your_jwt_secret_key', { expiresIn: '1h' });
    req.session.user = { username, token };
    res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.query;
    const { isbn } = req.params;
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }
    const username = req.session.user?.username;
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to post a review" });
    }
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    if (book.reviews[username]) {
        book.reviews[username] = review;
        res.status(200).json({ message: "Review updated successfully" });
    } else {
        book.reviews[username] = review;
        res.status(201).json({ message: "Review added successfully" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;  
    const username = req.session.user?.username; 
    if (!username) {
        return res.status(401).json({ message: "You must be logged in to delete a review" });
    }
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
    if (book.reviews[username]) {
        delete book.reviews[username];
        res.status(200).json({ message: "Review deleted successfully" });
    } else {
        res.status(404).json({ message: `No review found for user '${username}' on book with ISBN ${isbn}` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
