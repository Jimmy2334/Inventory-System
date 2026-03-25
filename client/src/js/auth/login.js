// login functionality is in js/auth/login.js, which is only loaded by login.html.
// This file is NOT a module and does not import anything.

// If already logged in, skip login page entirely

import { StorageManager } from "../utils/StorageManager.js";
if (sessionStorage.getItem("user_name")) {
  window.location.href = "index.html";
}

document.getElementById("login-btn").addEventListener("click", handleLogin);

document.getElementById("user_name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});

function handleLogin() {
  const input = document.getElementById("user_name");
  const passwordInput = document.getElementById("password");
  const errorEl = document.getElementById("login-error");
  const name = input.value.trim();

  // Clear previous error
  errorEl.style.display = "none";
  errorEl.textContent = "";

  if (!name) {
    errorEl.textContent = "Please enter your name to continue.";
    errorEl.style.display = "block";
    input.focus();
    return;
  }
  // let users = StorageManager.get("users") || [];
  // // Check if user exists, if not create a new one
  // let user = users.find((u) => u.username === name);
  // if (!user) {
  //   user = {
  //     id: crypto.randomUUID(),
  //     name: name,
  //     username: name,
  //     password: passwordInput.value || "admin123", // In a real app, NEVER store plaintext passwords!
  //   };
  //   users.push(user);
  //   StorageManager.set("users", users);
  // }
  sessionStorage.setItem("user_name", name);
  window.location.href = "index.html";
}
// function initStorage() {
//   const keys = [
//     'products',
//     'categories',
//     'suppliers',
//     'orders',
//     'adjustments',   // separate from activity_log
//     'activity_log',
//     'users',
//   ];
//   keys.forEach(key => {
//     if (StorageManager.get(key) === null) {
//       if (key === 'users') {
//         StorageManager.set(key, [
//           {
//             id: crypto.randomUUID(),
//             name: 'Admin',
//             username: 'admin',
//             password: 'admin123', // In a real app, NEVER store plaintext passwords!
//           }
//         ]);
//       } else {
//         StorageManager.set(key, []);
//       }
//     }
//   });
// }
