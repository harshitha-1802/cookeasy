// === Switch between login and signup screens ===
document.getElementById("signup-link")?.addEventListener("click", function () {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("signup-container").style.display = "block";
  document.getElementById("login-background").style.opacity = "0";
  document.getElementById("signup-background").style.opacity = "1";
});

document.getElementById("login-link")?.addEventListener("click", function () {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
  document.getElementById("login-background").style.opacity = "1";
  document.getElementById("signup-background").style.opacity = "0";
});

// === Password visibility toggle ===
function togglePassword(inputId) {
  let input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}

// === SIGNUP FORM SUBMISSION ===
document.querySelector(".signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Signup successful! You can now log in.");
      window.location.href = "login.html";
    } else {
      alert(data.error || "Signup failed.");
    }
  } catch (err) {
    console.error("Signup error:", err);
    alert("Something went wrong during signup.");
  }
});

// === LOGIN FORM SUBMISSION ===
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Login successful!");
      // You can store user data in localStorage if needed
      // localStorage.setItem('user', JSON.stringify(data));
      window.location.href = "index.html"; // or dashboard.html
    } else {
      alert(data.error || "Login failed.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong during login.");
  }
});
