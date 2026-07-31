const isAdminRoute = window.location.pathname.startsWith("/admin");

if (isAdminRoute) {
  void import("./entry-admin");
} else {
  void import("./entry-public");
}
