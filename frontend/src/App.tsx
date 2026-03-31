import { Navigate, Route, Routes } from "react-router-dom";

import { ShellLayout } from "./components/ShellLayout";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { CreateReservationPage } from "./pages/CreateReservationPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { SpacesPage } from "./pages/SpacesPage";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<SpacesPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/reservas/nueva" element={<CreateReservationPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
