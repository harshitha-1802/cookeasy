from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/recipes": {"origins": "*"}})

API_KEY = "b2b52443944e4a09a823eba4b170720e"  # Replace with your Spoonacular API key

@app.route('/')
def home():
    return "Flask Server is Running!"

@app.route('/recipes', methods=['GET'])
def get_recipes():
    ingredients = request.args.get('ingredients')
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400

    url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients={ingredients}&number=10&apiKey={API_KEY}"
    
    print(f"Fetching from Spoonacular: {url}")  # ✅ Debugging log

    try:
        response = requests.get(url)
        data = response.json()
        print("Fetched Data from Spoonacular:", data)  # ✅ Debugging log
        return jsonify(data)  # Return the fetched recipes
    except Exception as e:
        print("Error fetching recipes:", str(e))  # ✅ Debugging log
        return jsonify({"error": "Failed to fetch recipes", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)