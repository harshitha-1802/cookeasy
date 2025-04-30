const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Harshitha@18', // Replace with your MySQL password
    database: 'recipe_finder'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Signup route
app.post('/signup', async (req, res) => {
    console.log('Request received:', req.body);
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists.' });
            }
            return res.status(500).json({ message: 'Database error.' });
        }
        res.status(201).json({ message: 'User registered successfully.' });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to find the user by username
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Something went wrong.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        // Successful login
        res.status(200).json({ message: 'Login successful.', user: { id: user.id, username: user.username, email: user.email } });
    });
});
// Function to add a recipe to the meal plan
function addToMealPlan(sql, params, callback) {
    db.query(sql, params, callback);
}

// Function to retrieve meals for a date range
function getMealPlan(sql, params, callback) {
    db.query(sql, params, callback);
}

module.exports = {
    addToMealPlan,
    getMealPlan,
};

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
