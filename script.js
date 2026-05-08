// ── Domain validation ──────────────────────────────────────────
const ALLOWED_DOMAIN = "sampoernauniversity.ac.id";

function isValidSampoernaEmail(email) {
  const e = email.toLowerCase().trim();
  return e.endsWith("@" + ALLOWED_DOMAIN) || e.endsWith("." + ALLOWED_DOMAIN);
}

// ── Admin accounts ─────────────────────────────────────────────
const ADMIN_ACCOUNTS = [
  { email: "jennifer.siawiti@my.sampoernauniversity.ac.id", password: "admin098" },
  // Add more admins here:
  // { email: "admin@my.sampoernauniversity.ac.id", password: "adminXYZ" },
];

function isAdminAccount(email, password) {
  return ADMIN_ACCOUNTS.some(
    a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );
}

// ── LocalStorage helpers ───────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem("cc_users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("cc_users", JSON.stringify(users));
}

function setSession(email, role) {
  localStorage.setItem("cc_session", JSON.stringify({ email, role }));
}

function getSession() {
  return JSON.parse(localStorage.getItem("cc_session") || "null");
}

function clearSession() {
  localStorage.removeItem("cc_session");
}

// ── Eye toggle ─────────────────────────────────────────────────
function togglePassword(inputId, btn) {
  const input      = document.getElementById(inputId);
  const openIcon   = btn.querySelector(".eye-open-icon");
  const closedIcon = btn.querySelector(".eye-closed-icon");

  if (input.type === "password") {
    input.type = "text";
    if (openIcon)   openIcon.style.display   = "none";
    if (closedIcon) closedIcon.style.display = "";
    btn.setAttribute("aria-label", "Hide password");
  } else {
    input.type = "password";
    if (openIcon)   openIcon.style.display   = "";
    if (closedIcon) closedIcon.style.display = "none";
    btn.setAttribute("aria-label", "Show password");
  }
}

// ── Inline field error helpers ─────────────────────────────────
function showError(fieldId, msg) {
  const existing = document.getElementById(fieldId + "-error");
  if (existing) existing.remove();
  if (!msg) return;

  const field = document.getElementById(fieldId);
  if (!field) return;

  const err = document.createElement("div");
  err.id        = fieldId + "-error";
  err.className = "field-error";
  err.textContent = msg;

  const wrapper = field.closest(".field-wrapper") || field;
  wrapper.insertAdjacentElement("afterend", err);
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach(e => e.remove());
}

// ── LOGIN ──────────────────────────────────────────────────────
function login() {
  clearErrors();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  let valid = true;

  if (!email) {
    showError("email", "Please enter your email.");
    valid = false;
  } else if (!isValidSampoernaEmail(email)) {
    showError("email", "Please use a valid Sampoerna University email.");
    valid = false;
  }

  if (!password) {
    showError("password", "Please enter your password.");
    valid = false;
  }

  if (!valid) return;

  // Admin check
  if (isAdminAccount(email, password)) {
    setSession(email, "admin");
    window.location.href = "admin.html";
    return;
  }

  // Registered user check
  const users = getUsers();
  const key   = email.toLowerCase();

  if (!users[key]) {
    showError("email", "No account found. Please sign up first.");
    return;
  }

  if (users[key].password !== password) {
    showError("password", "Incorrect password.");
    return;
  }

  setSession(email, "user");
  window.location.href = "homepage.html";
}

// ── SIGN UP ────────────────────────────────────────────────────
function signup() {
  clearErrors();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  let valid = true;

  if (!email) {
    showError("email", "Please enter your email.");
    valid = false;
  } else if (!isValidSampoernaEmail(email)) {
    showError("email", "Please use a valid Sampoerna University email.");
    valid = false;
  }

  if (!password) {
    showError("password", "Please enter a password.");
    valid = false;
  } else if (password.length < 6) {
    showError("password", "Password must be at least 6 characters.");
    valid = false;
  }

  if (!valid) return;

  const users = getUsers();
  const key   = email.toLowerCase();

  if (users[key] || isAdminAccount(email, "")) {
    showError("email", "An account with this email already exists. Please log in.");
    return;
  }

  users[key] = { email, password, createdAt: new Date().toISOString() };
  saveUsers(users);

  setSession(email, "user");
  window.location.href = "homepage.html";
}

// ── FORGOT PASSWORD ────────────────────────────────────────────
function forgotPassword() {
  const email = prompt("Enter your Sampoerna University email for password reset:");
  if (!email) return;

  if (!isValidSampoernaEmail(email.trim())) {
    alert("Please use a valid Sampoerna University email.");
    return;
  }

  const users = getUsers();
  if (!users[email.trim().toLowerCase()]) {
    alert("No account found with that email.");
    return;
  }

  alert("Password reset link sent to " + email.trim() + " (demo)");
}

// ── LOGOUT ────────────────────────────────────────────────────
function logout() {
  clearSession();
  window.location.href = "login.html";
}

// ── AUTH GUARD ────────────────────────────────────────────────
// authGuard()          → any logged-in user
// authGuard("admin")   → admin only
function authGuard(requiredRole) {
  const session = getSession();
  if (!session) { window.location.href = "login.html"; return; }
  if (requiredRole === "admin" && session.role !== "admin") {
    window.location.href = "homepage.html";
  }
}

// ════════════════════════════════════════
// FEEDBACK LOGIC
// ════════════════════════════════════════
let anonymousChoice = false;

function chooseAnon(choice) {
  anonymousChoice = choice;
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "flex";

  const emailField    = document.getElementById("emailField");
  const feedbackBgImg = document.getElementById("feedbackBgImg");

  if (choice) {
    emailField.style.display = "none";
    if (feedbackBgImg) feedbackBgImg.src = "images/Sampoerna_Email.svg";
  } else {
    emailField.style.display = "flex";
    if (feedbackBgImg) feedbackBgImg.src = "images/Sampoerna_Email__2_.svg";
  }
}

function goBack() {
  document.getElementById("step2").style.display = "none";
  document.getElementById("step1").style.display = "flex";
}

function confirmSubmit() {
  const feedback = document.getElementById("feedback").value;
  const email    = document.getElementById("fbEmail") ? document.getElementById("fbEmail").value : "";

  if (!feedback) { alert("Please enter feedback first"); return; }
  if (!anonymousChoice && !email) { alert("Email is required if not anonymous"); return; }
  if (!anonymousChoice && email && !isValidSampoernaEmail(email)) {
    alert("Please use a valid Sampoerna University email.");
    return;
  }

  document.getElementById("step3-overlay").style.display = "flex";
}

function goBackToInput() {
  document.getElementById("step3-overlay").style.display = "none";
}

function submitFeedbackFinal() {
  const isAnon   = anonymousChoice;
  const email    = isAnon ? null : (document.getElementById("fbEmail") ? document.getElementById("fbEmail").value.trim() : null);
  const feedback = document.getElementById("feedback").value.trim();

  // POST to Node.js server which appends directly to feedback_log.txt
  fetch("http://localhost:3000/log-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAnon, email, feedback })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.success) console.error("Logging failed:", data.error);
  })
  .catch(function(err) {
    console.error("Could not reach feedback server:", err);
  });

  document.getElementById("step3-overlay").style.display = "none";
  document.getElementById("step2").style.display         = "none";
  document.getElementById("step4").style.display         = "flex";
}

function resetFeedback() {
  document.getElementById("step4").style.display = "none";
  document.getElementById("step1").style.display = "flex";
  document.getElementById("feedback").value      = "";
  const fbEmail = document.getElementById("fbEmail");
  if (fbEmail) fbEmail.value = "";
}
