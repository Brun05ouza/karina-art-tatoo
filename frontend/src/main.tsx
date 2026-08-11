const isAdminRoute = window.location.pathname.startsWith("/admin");

async function loadAdminApp() {
  await import("./entry-admin");
}

async function loadPublicApp() {
  await import("./entry-public");
}

if (isAdminRoute) {
  void loadAdminApp();
} else {
  void loadPublicApp();
}
