document.addEventListener("DOMContentLoaded", () => {
  const addPurchaseBtn = document.getElementById("addPurchase");
  const purchaseModalElement = document.getElementById("purchaseModal");

  if (!addPurchaseBtn || !purchaseModalElement || !window.bootstrap) {
    return;
  }

  const purchaseModal = new bootstrap.Modal(purchaseModalElement);

  addPurchaseBtn.addEventListener("click", () => {
    purchaseModal.show();
  });
});
