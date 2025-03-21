const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const API_KEY = "b2b52443944e4a09a823eba4b170720e";

app.get("/recipes", async (req, res) => {
    let ingredients = req.query.ingredients;

    if (!ingredients) {
        return res.status(400).json({ error: "Ingredients are required" });
    }

    let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${API_KEY}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
