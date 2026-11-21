import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.vehiclesList()
      .then((data: any) => setVehicles(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message || 'No se pudieron cargar los vehiculos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Mis vehiculos
        </h2>
        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <p>No hay vehiculos registrados.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Anio</th>
                <th>Patente</th>
                <th>Kilometraje</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>{v.brand}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>{v.plateRaw || v.plate_norm}</td>
                  <td>{v.mileage} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
