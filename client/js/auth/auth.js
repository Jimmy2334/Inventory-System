// js/auth/auth.js
// Loaded ONLY by login.html — not a module, no imports needed

// If already logged in, skip login page entirely
if (sessionStorage.getItem('user_name')) {
  window.location.href = 'index.html';
}

document.getElementById('login-btn')
  .addEventListener('click', handleLogin);

document.getElementById('username-input')
  .addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

function handleLogin() {
  const input   = document.getElementById('username-input');
  const errorEl = document.getElementById('login-error');
  const name    = input.value.trim();

  // Clear previous error
  errorEl.style.display = 'none';
  errorEl.textContent   = '';

  if (!name) {
    errorEl.textContent = 'Please enter your name to continue.';
    errorEl.style.display = 'block';
    input.focus();
    return;
  }

  sessionStorage.setItem('user_name', name);
  window.location.href = 'index.html';
}
