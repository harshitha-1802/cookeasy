document.getElementById("signup-link").addEventListener("click", function() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("signup-container").style.display = "block";
  document.getElementById("login-background").style.opacity = "0";
  document.getElementById("signup-background").style.opacity = "1";
});

document.getElementById("login-link").addEventListener("click", function() {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
  document.getElementById("login-background").style.opacity = "1";
  document.getElementById("signup-background").style.opacity = "0";
});

// Password visibility toggle
function togglePassword(inputId) {
  let input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}
