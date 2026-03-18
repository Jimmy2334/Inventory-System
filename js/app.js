console.log("InvenTrack App Starting...");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Ready");

  if (window.UIModule) {
    console.log("✓ UIModule loaded");
  }
  if (window.SidebarModule) {
    console.log("✓ SidebarModule loaded");
  }
  if (window.StorageManager) {
    console.log("✓ StorageManager loaded");
  }

  console.log("InvenTrack App Ready!");
});
