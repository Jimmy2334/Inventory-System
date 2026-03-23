// js/auth/authGuard.js

export function guardAuth() {
  const name = sessionStorage.getItem('user_name');

  if (!name) {
    // Works whether index.html is at root or inside a subfolder
    window.location.href = 'login.html';
    return null;
  }

  return name;
}
