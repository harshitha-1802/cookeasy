from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import re
import html

app = Flask(__name__)
CORS(app)

# 🔐 Configure Gemini API key
genai.configure(api_key="AIzaSyB5T1Tyhe9C6X2zVZBn-gH_IQpIsDjKFmQ")

# Use one of the available models from your list
MODEL_NAME = "models/gemini-1.5-pro"  # This is one of your available models

@app.route("/", methods=["GET"])
def index():
    return "CookEasy API is running. Use POST /ask to ask cooking questions."

@app.route("/models", methods=["GET"])
def list_models():
    try:
        available_models = []
        for model in genai.list_models():
            model_info = {
                "name": model.name,
                "display_name": model.display_name,
                "description": model.description,
                "supported_generation_methods": model.supported_generation_methods
            }
            available_models.append(model_info)
        return jsonify({"available_models": available_models})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def format_response_with_html(text):
    """Format the response with clean HTML for better presentation."""
    # First, let's identify the main sections using regex
    sections = {}
    
    # Find the introduction (text before Ingredients)
    intro_match = re.match(r'^(.*?)(?=\*\*Ingredients:|$)', text, re.DOTALL)
    if intro_match:
        sections['intro'] = intro_match.group(1).strip()
    
    # Find the ingredients section
    ingredients_match = re.search(r'\*\*Ingredients:\*\*(.*?)(?=\*\*Instructions:|$)', text, re.DOTALL)
    if ingredients_match:
        sections['ingredients'] = ingredients_match.group(1).strip()
    
    # Find the instructions section
    instructions_match = re.search(r'\*\*Instructions:\*\*(.*?)(?=\*\*Cooking Time:|$)', text, re.DOTALL)
    if instructions_match:
        sections['instructions'] = instructions_match.group(1).strip()
    
    # Find cooking time
    cooking_time_match = re.search(r'\*\*Cooking Time:\*\*(.*?)(?=\*\*Serving Size:|$)', text, re.DOTALL)
    if cooking_time_match:
        sections['cooking_time'] = cooking_time_match.group(1).strip()
    
    # Find serving size
    serving_size_match = re.search(r'\*\*Serving Size:\*\*(.*?)(?=\*\*Tips:|$)', text, re.DOTALL)
    if serving_size_match:
        sections['serving_size'] = serving_size_match.group(1).strip()
    
    # Find tips
    tips_match = re.search(r'\*\*(?:Tips|Helpful Tips):\*\*(.*?)$', text, re.DOTALL)
    if tips_match:
        sections['tips'] = tips_match.group(1).strip()
    
    # Now build the HTML output
    html_output = '<div class="recipe-container">'
    
    # Add introduction
    if 'intro' in sections:
        html_output += f'<div class="recipe-intro">{html.escape(sections["intro"])}</div>'
    
    # Add ingredients section
    if 'ingredients' in sections:
        html_output += '<div class="recipe-section">'
        html_output += '<h3 class="section-title">Ingredients</h3>'
        html_output += '<ul class="ingredients-list">'
        
        # Extract individual ingredients (lines starting with * or •)
        ingredients = re.findall(r'(?:^|\n)\s*(?:\*|•)\s+(.*?)(?=\n\s*(?:\*|•)|$)', sections['ingredients'], re.DOTALL)
        for ingredient in ingredients:
            html_output += f'<li class="ingredient-item">{html.escape(ingredient.strip())}</li>'
        
        html_output += '</ul></div>'
    
    # Add instructions section
    if 'instructions' in sections:
        html_output += '<div class="recipe-section">'
        html_output += '<h3 class="section-title">Instructions</h3>'
        html_output += '<ol class="instructions-list">'
        
        # Extract numbered steps
        steps = re.findall(r'(?:^|\n)\s*(\d+)\.\s+(.*?)(?=\n\s*\d+\.|$)', sections['instructions'], re.DOTALL)
        for num, step in steps:
            # Remove any markdown bold formatting
            step = re.sub(r'\*\*(.*?)\*\*', r'\1', step)
            html_output += f'<li class="instruction-step">{html.escape(step.strip())}</li>'
        
        html_output += '</ol></div>'
    
    # Add cooking time
    if 'cooking_time' in sections:
        html_output += '<div class="recipe-info">'
        html_output += '<h3 class="info-title">Cooking Time</h3>'
        html_output += f'<p>{html.escape(sections["cooking_time"])}</p>'
        html_output += '</div>'
    
    # Add serving size
    if 'serving_size' in sections:
        html_output += '<div class="recipe-info">'
        html_output += '<h3 class="info-title">Serving Size</h3>'
        html_output += f'<p>{html.escape(sections["serving_size"])}</p>'
        html_output += '</div>'
    
    # Add tips
    if 'tips' in sections:
        html_output += '<div class="recipe-tips">'
        html_output += '<h3 class="tips-title">Helpful Tips</h3>'
        
        # Extract individual tips (lines starting with * or •)
        tips = re.findall(r'(?:^|\n)\s*(?:\*|•)\s+(.*?)(?=\n\s*(?:\*|•)|$)', sections['tips'], re.DOTALL)
        
        if tips:
            html_output += '<ul class="tips-list">'
            for tip in tips:
                html_output += f'<li class="tip-item">{html.escape(tip.strip())}</li>'
            html_output += '</ul>'
        else:
            # If no bullet points, just use the whole text
            html_output += f'<p>{html.escape(sections["tips"])}</p>'
        
        html_output += '</div>'
    
    html_output += '</div>'
    return html_output

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        # Use one of the available models from your list
        model = genai.GenerativeModel(MODEL_NAME)
        
        # Define cooking-specific system prompt with improved formatting instructions
        cooking_prompt = """
        You are CookEasy, a helpful cooking assistant specializing in recipes, cooking techniques, 
        ingredient substitutions, and food-related advice. When responding to queries:

        1. If asked for a recipe, provide:
           - Start with a brief introduction about the dish
           - Section titled "**Ingredients:**" with a bulleted list (use * symbol) of ingredients with measurements
           - Section titled "**Instructions:**" with clearly numbered steps (1., 2., etc.)
           - Section titled "**Cooking Time:**" with preparation and cooking duration
           - Section titled "**Serving Size:**" with number of servings
           - Section titled "**Tips:**" with helpful cooking tips as a bulleted list

        2. For ingredient substitutions, explain:
           - Suitable alternatives as a bulleted list (use * symbol)
           - How they might affect taste/texture
           - Conversion ratios if applicable

        3. For cooking techniques, explain:
           - The process in clear numbered steps (1., 2., etc.)
           - Common mistakes to avoid as a bulleted list (use * symbol)
           - Equipment needed as a bulleted list (use * symbol)

        4. For nutritional questions:
           - Provide general nutritional information in a structured format
           - Mention if certain diets accommodate the food (vegan, keto, etc.)

        5. If asked about non-cooking topics, politely redirect to cooking-related subjects.

        Please answer the following question about cooking:
        """
        
        # Create a conversation with the system prompt and question
        response = model.generate_content(cooking_prompt + "\n\n" + question)
        
        # Format the response with HTML styling
        formatted_response = format_response_with_html(response.text)
        
        # Return both the styled HTML and the plain text for flexibility
        return jsonify({
            "answer_html": formatted_response,
            "answer_text": response.text,
            "user_question": question
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Make sure to specify the port you want to use
    app.run(debug=True, host='0.0.0.0', port=5001)
