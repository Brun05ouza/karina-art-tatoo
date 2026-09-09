if (location.pathname.startsWith("/admin")) {
  void import("./entry-admin");
} else {
  void import("./entry-public");
}
