let allRecipes = [];
let currentIndex = 0;
const PAGE_SIZE = 6;

// DOM ready
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchButton").addEventListener("click", searchRecipe);
  document.getElementById("loadMoreBtn").addEventListener("click", loadMoreRecipes);
  document.querySelector(".close-btn").addEventListener("click", closeModal);
  document.getElementById("backButton")?.addEventListener("click", closeModal);
  addScrollAnimation();
});

// 1. Search & filter
async function searchRecipe() {
  const q = document.getElementById("search-bar").value.trim();
  const container = document.querySelector(".recipe-container");
  const loadBtn = document.getElementById("loadMoreBtn");
  if (!q) return alert("Please enter ingredients.");

  container.innerHTML = "<p>Fetching recipes…</p>";
  loadBtn.style.display = "none";
  currentIndex = 0;

  try {
    const resp = await fetch(`http://127.0.0.1:5000/recipes?ingredients=${encodeURIComponent(q)}`);
    const data = await resp.json();
    allRecipes = data;
    container.innerHTML = "";
    if (!data.length) {
      container.innerHTML = "<p>No recipes found.</p>";
    } else {
      loadMoreRecipes();
      if (data.length > PAGE_SIZE) loadBtn.style.display = "block";
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p>Error fetching recipes.</p>";
  }
}

// 2. Pagination + card rendering with duration
async function loadMoreRecipes() {
  const container = document.querySelector(".recipe-container");
  const slice = allRecipes.slice(currentIndex, currentIndex + PAGE_SIZE);

  for (let recipe of slice) {
    // Fetch details to get readyInMinutes
    let duration = "";
    try {
      const detResp = await fetch(`http://127.0.0.1:5000/recipe/${recipe.id}`);
      const det = await detResp.json();
      duration = det.readyInMinutes ? `${det.readyInMinutes} min` : "";
    } catch {
      duration = "";
    }

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.dataset.id = recipe.id;
    card.innerHTML = `
      <button class="heart-btn">&#9825;</button>
      <div class="card-content">
        <div class="card-image">
          <img src="${recipe.image}" alt="${recipe.title}">
        </div>
        <div class="card-info">
          <h3>${recipe.title}</h3>
          <p class="duration">${duration}</p>
          <p>Used: ${recipe.usedIngredientCount}, Missing: ${recipe.missedIngredientCount}</p>
        </div>
      </div>
    `;

    // Open details on card click
    card.addEventListener("click", () => openDetails(recipe.id));

    // Heart button toggle + add to favorites
    const heartBtn = card.querySelector(".heart-btn");
    heartBtn.addEventListener('click', async function(e) {
      e.stopPropagation();

      // Toggle heart icon
      this.classList.toggle('active');
      this.innerHTML = this.classList.contains('active') ? '&#10084;' : '&#9825;';

      // Check login
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (!loggedInUser) {
        alert('Please log in to add favorites.');
        this.classList.remove('active');
        this.innerHTML = '&#9825;';
        return;
      }
      const userId = loggedInUser.id;

      const recipeId = this.closest('.recipe-card').dataset.id;
      const recipeTitle = recipe.title;
      const recipeImage = recipe.image;

      if (this.classList.contains('active')) {
        try {
          const response = await fetch('http://localhost:5000/add-to-favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              recipe_id: recipeId,
              recipe_title: recipeTitle,
              recipe_image: recipeImage
            })
          });
          const result = await response.json();
          if (response.ok) {
            console.log('Recipe added to favorites:', result.message);
          } else {
            console.error('Failed to add to favorites:', result);
          }
        } catch (err) {
          console.error('Error adding to favorites:', err);
        }
      } else {
        // Optionally: remove from favorites logic here
        console.log(`Removed from favorites: Recipe ID ${recipeId}`);
      }
    });

    container.appendChild(card);
  }

  currentIndex += PAGE_SIZE;
  if (currentIndex >= allRecipes.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }
}

// 3. Modal & stepwise instructions
async function openDetails(id) {
  try {
    const resp = await fetch(`http://127.0.0.1:5000/recipe/${id}`);
    const info = await resp.json();

    // Hide nav
    document.querySelector("nav").style.display = "none";

    // Populate modal fields
    document.getElementById("modalTitle").textContent = info.title;
    document.getElementById("modalImage").src = info.image;

    // Instructions as numbered steps
    const instrContainer = document.getElementById("modalInstructions");
    instrContainer.innerHTML = "";
    if (info.analyzedInstructions?.length) {
      const steps = info.analyzedInstructions[0].steps;
      const ol = document.createElement("ol");
      for (let s of steps) {
        const li = document.createElement("li");
        li.textContent = s.step;
        ol.appendChild(li);
      }
      instrContainer.appendChild(ol);
    } else {
      instrContainer.innerHTML = info.instructions || "<p>No instructions provided.</p>";
    }

    // Nutrition (first 5)
    const nutritionList = document.getElementById("modalNutrition");
    nutritionList.innerHTML = "";
    (info.nutrition?.nutrients || []).slice(0, 5).forEach(n => {
      const li = document.createElement("li");
      li.textContent = `${n.name}: ${n.amount}${n.unit}`;
      nutritionList.appendChild(li);
    });

    // Show modal
    document.getElementById("recipeModal").style.display = "flex";
  } catch (e) {
    console.error("Error loading details:", e);
    alert("Failed to load recipe details.");
  }
}

function closeModal() {
  // Show nav again
  document.querySelector("nav").style.display = "flex";
  document.getElementById("recipeModal").style.display = "none";
}

// 4. Scroll animation
function addScrollAnimation() {
  const feats = document.querySelectorAll(".feature");
  const handler = () => {
    const h = window.innerHeight;
    feats.forEach(f => {
      const { top, bottom } = f.getBoundingClientRect();
      f.classList.toggle("visible", top < h && bottom > 0);
    });
  };
  window.addEventListener("scroll", handler);
  handler();
}

