from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
# Enable CORS on every route
CORS(app)

# Spoonacular API key
API_KEY = os.getenv("SPOONACULAR_API_KEY", "dd9a6d2e95d24ddf91ad027f555a714d")

@app.route('/')
def home():
    return "Flask Server is Running!"

# Search by ingredients
@app.route('/recipes', methods=['GET'])
def get_recipes():
    ingredients = request.args.get('ingredients')
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400

    url = (
        f"https://api.spoonacular.com/recipes/findByIngredients"
        f"?ingredients={ingredients}&number=20&apiKey={API_KEY}"
    )
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch recipes", "message": str(e)}), 500

# Detailed info for one recipe
@app.route('/recipe/<int:recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    url = (
        f"https://api.spoonacular.com/recipes/{recipe_id}/information"
        f"?includeNutrition=true&apiKey={API_KEY}"
    )
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch recipe details", "message": str(e)}), 500

# New endpoint: forward add-to-favorites to your Express backend
@app.route('/add-to-favorites', methods=['POST'])
def add_to_favorites():
    data = request.get_json()
    user_id = data.get('user_id')
    recipe_id = data.get('recipe_id')
    recipe_title = data.get('recipe_title')
    recipe_image = data.get('recipe_image')

    # Log incoming data
    app.logger.debug(f"add-to-favorites payload: {data}")

    express_backend_url = "http://localhost:5000/add-to-favorites"
    try:
        resp = requests.post(express_backend_url, json=data)
        resp.raise_for_status()
        # Log Express response
        app.logger.debug(f"Express response: {resp.status_code} {resp.text}")
        return jsonify({"message": "Recipe added to favorites successfully!"}), 200
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error forwarding to Express: {e}")
        return jsonify({"error": "Failed to add recipe to favorites", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
