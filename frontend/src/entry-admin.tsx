import { createRoot } from "react-dom/client";
import { AdminApp } from "./admin/AdminApp";
import "./admin/styles/admin.css";

createRoot(document.getElementById("root")!).render(<AdminApp />);
