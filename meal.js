const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) return window.location.href = 'login.html';

  const planForm = document.getElementById('plan-form');
  days.forEach(day => {
    const row = document.createElement('div');
    row.className = 'plan-row';
    row.innerHTML = `
      <label>${day}</label>
      <input type="number" id="input-${day}" placeholder="Recipe ID" />
    `;
    planForm.appendChild(row);
  });

  // Compute Monday & Sunday of current week
  const today = new Date();
  const diff = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
  const monday = new Date(today - diff * 864e5);
  const sunday = new Date(monday.getTime() + 6 * 864e5);
  const fmt = d => d.toISOString().slice(0,10);

  // Fetch existing plan
  const resp = await fetch(`http://localhost:5000/mealplan?user_id=${user.id}&start_date=${fmt(monday)}&end_date=${fmt(sunday)}`);
  const { plan } = await resp.json();
  // Pre-fill inputs and display
  plan.forEach(item => {
    const dayName = new Date(item.meal_date).toLocaleDateString('en-US',{weekday:'long'});
    const inp = document.getElementById(`input-${dayName}`);
    if (inp) inp.value = item.recipe_id;
  });
  displayPlan(plan);

  // Save button
  document.getElementById('savePlanBtn').addEventListener('click', async () => {
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const recipeId = document.getElementById(`input-${day}`).value;
      if (!recipeId) continue;
      const mealDate = new Date(monday.getTime() + i * 864e5);
      await fetch('http://localhost:5000/add-to-mealplan', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          user_id: user.id,
          recipe_id: Number(recipeId),
          meal_date: fmt(mealDate)
        })
      });
    }
    alert('Meal plan saved!');
    // reload display
    const updated = await (await fetch(`http://localhost:5000/mealplan?user_id=${user.id}&start_date=${fmt(monday)}&end_date=${fmt(sunday)}`)).json();
    displayPlan(updated.plan);
  });
});

// Render the saved plan as cards
function displayPlan(plan) {
  const container = document.getElementById('planDisplay');
  container.innerHTML = '';
  plan.forEach(item => {
    const div = document.createElement('div');
    div.className = 'plan-card';
    div.innerHTML = `
      <h4>${item.meal_date}</h4>
      <img src="${item.recipe_image}" alt="${item.recipe_title}" />
      <p>${item.recipe_title}</p>
    `;
    container.appendChild(div);
  });
}
