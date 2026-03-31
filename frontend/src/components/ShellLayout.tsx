import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Espacios" },
  { to: "/reservas", label: "Reservas" },
  { to: "/reservas/nueva", label: "Nueva Reserva" },
  { to: "/admin", label: "Admin IoT" }
];

export function ShellLayout(): JSX.Element {
  const location = useLocation();
  return (
    <div className="app-shell">
      <header>
        <h1>Darient Coworking</h1>
        <nav>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active-link" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
