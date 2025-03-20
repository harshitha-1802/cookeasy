document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("searchButton").addEventListener("click", searchRecipe);
});

async function searchRecipe() {
    let query = document.getElementById("search-bar").value.trim();
    let recipeContainer = document.querySelector(".recipe-container");

    console.log("User Input:", query); // ✅ Check input value

    if (!query) {
        alert("Please enter ingredients.");
        return;
    }

    recipeContainer.innerHTML = "<p>Fetching recipes...</p>";

    let apiUrl = `http://127.0.0.1:5000/recipes?ingredients=${query}`;
    console.log("Fetching from API:", apiUrl); // ✅ Check API URL

    try {
        let response = await fetch(apiUrl);
        console.log("Response Object:", response); // ✅ Log full response

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        console.log("Fetched Data:", data); // ✅ Log fetched JSON data

        recipeContainer.innerHTML = "";

        if (data.length === 0) {
            recipeContainer.innerHTML = "<p>No recipes found. Try different ingredients.</p>";
            return;
        }

        data.forEach(recipe => {
            let recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");
            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <p>Used Ingredients: ${recipe.usedIngredientCount}, Missing: ${recipe.missedIngredientCount}</p>
            `;
            recipeContainer.appendChild(recipeCard);
        });

    } catch (error) {
        console.error("Error fetching recipes:", error); // ✅ Log error details
        recipeContainer.innerHTML = "<p>Failed to fetch recipes. Try again later.</p>";
    }
}

// ✅ Scroll Animation for Feature Sections
document.addEventListener("DOMContentLoaded", function () {
    const features = document.querySelectorAll(".feature");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.3
    });

    features.forEach(feature => {
        observer.observe(feature);
    });
});

