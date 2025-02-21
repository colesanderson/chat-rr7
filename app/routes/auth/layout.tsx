import { Outlet, Link } from "react-router";

export default function AuthLayout() {
  return (
    <div>
      <nav>
        <Link to="/login">Login</Link> |<Link to="/register">Register</Link>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
