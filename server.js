const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8000; // Use a port that doesn't conflict with other apps

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Harshitha@18', // Replace with your MySQL password
    database: 'recipe_finder', // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Add a meal to the plans table
app.post('/add-to-mealplan', (req, res) => {
    const { meal, date } = req.body;

    if (!meal || !date) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const sql = `
        INSERT INTO plans (meal, date)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE meal = VALUES(meal)
    `;

    db.query(sql, [meal, date], (err, result) => {
        if (err) {
            console.error('DB insert error:', err);
            return res.status(500).json({ success: false, message: 'DB error' });
        }
        res.json({ success: true, message: 'Meal plan added successfully.' });
    });
});

// Retrieve all meal plans
app.get('/mealplan', (req, res) => {
    const sql = 'SELECT * FROM plans ORDER BY date ASC';

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('DB select error:', err);
            return res.status(500).json({ success: false, message: 'DB error' });
        }
        res.json({ success: true, plan: rows });
    });
});
app.get("/recipes", async (req, res) => {
  const ingredients = req.query.ingredients;

  if (!ingredients) {
      return res.status(400).json({ error: "Ingredients are required" });
  }

  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${API_KEY}`;

  try {
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
  }
});
// Delete a meal plan by ID
app.delete('/delete-mealplan/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM plans WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('DB delete error:', err);
            return res.status(500).json({ success: false, message: 'DB error' });
        }
        res.json({ success: true, message: 'Meal plan deleted successfully.' });
    });
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
