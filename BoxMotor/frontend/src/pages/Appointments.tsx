import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.appointmentsList()
      .then((data: any) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message || 'No se pudieron cargar los turnos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Mis turnos
        </h2>
        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No tienes turnos agendados.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.startsAt).toLocaleString('es-AR')}</td>
                  <td>{a.serviceId}</td>
                  <td>
                    <span className={`badge badge-${a.status.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
