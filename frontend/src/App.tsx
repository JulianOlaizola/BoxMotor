import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import MecanicoDashboard from './pages/mecanico';
import AdminDashboard from './pages/admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('boxmotor_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="brand">
            BoxMotor<span>.</span>
          </a>
          <div className="nav-links">
            <a href="/" className="nav-link">Inicio</a>
            <a href="/servicios" className="nav-link">Servicios</a>
            {localStorage.getItem('boxmotor_token') ? (
              <>
                <a href="/vehiculos" className="nav-link">Mis vehiculos</a>
                <a href="/turnos" className="nav-link">Turnos</a>
                <a href="/mecanico" className="nav-link">Panel mecánico</a>
                <a href="/admin" className="nav-link">Administración</a>
                <a href="/logout" className="nav-link" onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem('boxmotor_token');
                  window.location.href = '/login';
                }}>Cerrar sesion</a>
              </>
            ) : (
              <>
                <a href="/login" className="nav-link">Iniciar sesion</a>
                <a href="/registro" className="nav-link btn btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>Registrarse</a>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/vehiculos"
            element={
              <ProtectedRoute>
                <Vehicles />
              </ProtectedRoute>
            }
          />
          <Route path="/servicios" element={<Services />} />
          <Route
            path="/turnos"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mecanico"
            element={
              <ProtectedRoute>
                <MecanicoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
