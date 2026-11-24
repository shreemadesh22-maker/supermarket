// Replace supermart-phase1-frontend/js/app.js with this file.
// The frontend is served by Express on the same origin, so session cookies work.

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const message = document.getElementById("form-message");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Login failed.");
        window.location.href = "/store";
      } catch (error) {
        message.textContent = error.message || "Unable to connect to the server.";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!registerForm.reportValidity()) return;

      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      if (password !== confirmPassword) {
        message.textContent = "Passwords do not match. Please try again.";
        return;
      }

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            password
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Registration failed.");
        window.location.href = "/store";
      } catch (error) {
        message.textContent = error.message || "Unable to connect to the server.";
      }
    });
  }
});
