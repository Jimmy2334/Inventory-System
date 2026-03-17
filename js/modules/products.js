const openBtn = document.getElementById("openFormBtn");
const closeBtn = document.getElementById("closeFormBtn");
const formContainer = document.getElementById("productFormContainer");
openBtn.onclick = () => {
  formContainer.classList.add("active");
};

closeBtn.onclick = () => {
  formContainer.classList.remove("active");
};

document.querySelectorAll(".fa-trash").forEach((btn) => {
  btn.addEventListener("click", () => {
    const row = btn.closest("tr");
    const productName = row.querySelector(".name").innerText;

    // Show confirm dialog
    const confirmDelete = confirm(
      `Are you sure you want to delete "${productName}"?`,
    );
    if (confirmDelete) {
      // Delete row from table (or call backend)
      row.remove();
      alert(`${productName} deleted successfully!`);
    }
  });
});
