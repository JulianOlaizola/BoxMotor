import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function MecanicoDashboard() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.workOrdersList()
      .then((data: any) => setWorkOrders(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message || 'No se pudieron cargar los trabajos'))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      RECEIVED: 'badge-pending',
      DIAGNOSIS: 'badge-pending',
      WAITING_APPROVAL: 'badge-pending',
      WAITING_PARTS: 'badge-pending',
      IN_PROGRESS: 'badge-confirmed',
      QUALITY_CHECK: 'badge-confirmed',
      READY_FOR_PICKUP: 'badge-completed',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return `<span class="badge ${map[status] || 'badge-pending'}">${status}</span>`;
  };

  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Panel del mecánico
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Trabajos asignados a este mecánico. Desde aquí se registran diagnósticos,
          se actualizan tareas y se avanza el estado de cada orden.
        </p>

        {loading ? (
          <div>Cargando trabajos...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : workOrders.length === 0 ? (
          <div className="empty-state">
            <p>No tienes trabajos asignados actualmente.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Problema declarado</th>
                <th>Estado</th>
                <th>Kilometraje ingreso</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id}>
                  <td>{wo.vehicleId}</td>
                  <td>{wo.customerId}</td>
                  <td>{wo.problem || '-'}</td>
                  <td>{statusBadge(wo.status)}</td>
                  <td>{wo.mileageIn} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
