import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.servicesList()
      .then((data: any) => setServices(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message || 'No se pudieron cargar los servicios'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Servicios del taller
        </h2>
        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <p>No hay servicios disponibles.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Descripcion</th>
                <th>Duracion (min)</th>
                <th>Mano de obra</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.description || '-'}</td>
                  <td>{s.durationMin}</td>
                  <td>${s.laborPrice?.toLocaleString('es-AR')}</td>
                  <td>
                    <span className={`badge ${s.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {s.active ? 'Activo' : 'Inactivo'}
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
