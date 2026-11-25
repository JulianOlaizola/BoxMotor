import { useState } from 'react';
import { api } from '../services/api';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkHealth() {
    try {
      const res = await api.health();
      setStatus(res.status);
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con la API');
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="page-title">BoxMotor</h1>
        <p>
          Plataforma integral de gestion de talleres meccanicos multimarca.
          Digitaliza turnos, ordenes de trabajo, presupuestos, repuestos e
          inventario en un solo sistema.
        </p>

        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={checkHealth}
            disabled={status === 'ok'}
          >
            {status === 'ok' ? 'API conectada' : 'Verificar conexion con API'}
          </button>
          {status === 'ok' && (
            <span style={{ marginLeft: '0.75rem', color: '#166534', fontWeight: '600' }}>
              ✓ Backend operativo
            </span>
          )}
          {error && <div className="alert alert-error">{error}</div>}
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card" style={{ padding: '1.2rem' }}>
            <h3 style={{ color: '#0f3d56', marginBottom: '0.5rem' }}>Para clientes</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#6b7280', fontSize: '0.9rem' }}>
              <li>Registrar vehiculos</li>
              <li>Solicitar turnos</li>
              <li>Consultar presupuestos</li>
              <li>Seguir reparaciones</li>
            </ul>
          </div>
          <div className="card" style={{ padding: '1.2rem' }}>
            <h3 style={{ color: '#0f3d56', marginBottom: '0.5rem' }}>Para el taller</h3>
            <ul style={{ paddingLeft: '1.2rem', color: '#6b7280', fontSize: '0.9rem' }}>
              <li>Gestionar ordenes de trabajo</li>
              <li>Control de inventario</li>
              <li>Diagnosticos y estados</li>
              <li>Estadisticas y auditoria</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
