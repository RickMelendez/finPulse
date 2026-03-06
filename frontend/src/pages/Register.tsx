import { Navigate } from "react-router-dom";

// Registration is now handled inside Login with a mode toggle.
// This redirect keeps the /register route working for any existing links.
export function Register() {
  return <Navigate to="/login?mode=register" replace />;
}
