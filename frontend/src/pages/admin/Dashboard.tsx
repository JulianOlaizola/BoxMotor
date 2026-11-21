import { useEffect, useState } from 'react';
import { api } from '../../services/api';

type Tab = 'clientes' | 'vehiculos' | 'mecanicos' | 'servicios' | 'repuestos' | 'ordenes' | 'presupuestos' | 'inventario' | 'auditoria';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('clientes');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchers: Record<Tab, () => Promise<any>> = {
    clientes: () => api.customersList(),
    vehiculos: () => api.vehiclesList(),
    mecanicos: () => api.mechanicsList(),
    servicios: () => api.servicesList(),
    repuestos: () => api.partsList(),
    ordenes: () => api.workOrdersList(),
    presupuestos: () => api.estimatesList(),
    inventario: () => api.inventoryMovementsList(),
    auditoria: () => api.auditLogsList(),
  };

  const fetchData = async (t: Tab) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchers[t]();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(tab); }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'clientes', label: 'Clientes' },
    { key: 'vehiculos', label: 'Vehículos' },
    { key: 'mecanicos', label: 'Mecánicos' },
    { key: 'servicios', label: 'Servicios' },
    { key: 'repuestos', label: 'Repuestos' },
    { key: 'ordenes', label: 'Órdenes de trabajo' },
    { key: 'presupuestos', label: 'Presupuestos' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'auditoria', label: 'Auditoría' },
  ];

  return (
    <div className="page">
      <div className="card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Panel administrativo
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Gestión completa del taller: clientes, vehículos, mecánicos, servicios,
          repuestos, órdenes de trabajo, presupuestos, inventario y auditoría.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); }}
              className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>{renderHeaders(tab).map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={renderHeaders(tab).length} style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    Sin datos
                  </td>
                </tr>
              ) : data.map((row, i) => (
                <tr key={i}>{renderRow(tab, row).map((c, j) => <td key={j}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function renderHeaders(tab: Tab) {
  switch (tab) {
    case 'clientes': return ['ID', 'Usuario', 'Teléfono', 'Dirección'];
    case 'vehiculos': return ['ID', 'Cliente', 'Marca', 'Modelo', 'Patente', 'Año', 'Kilometraje'];
    case 'mecanicos': return ['ID', 'Especialidades', 'Activo'];
    case 'servicios': return ['ID', 'Nombre', 'Duración (min)', 'Mano de obra', 'Activo'];
    case 'repuestos': return ['ID', 'Código', 'Nombre', 'Marca', 'Categoría', 'Precio', 'Stock', 'Mínimo'];
    case 'ordenes': return ['ID', 'Vehículo', 'Mecánico', 'Estado', 'Kilometraje ingreso'];
    case 'presupuestos': return ['ID', 'Orden', 'Total', 'Estado', 'Vencimiento'];
    case 'inventario': return ['ID', 'Repuesto', 'Tipo', 'Cantidad', 'Fecha'];
    case 'auditoria': return ['ID', 'Usuario', 'Acción', 'Entidad', 'Fecha'];
  }
}

function renderRow(tab: Tab, row: any) {
  switch (tab) {
    case 'clientes': return [row.id, row.userId, row.phone || '-', row.address || '-'];
    case 'vehiculos': return [row.id, row.customerId, row.brand, row.model, row.plateRaw || row.plate_norm, row.year, row.mileage + ' km'];
    case 'mecanicos': return [row.id, (row.specialties || []).join(', '), row.active ? 'Sí' : 'No'];
    case 'servicios': return [row.id, row.name, row.durationMin, '$' + row.laborPrice, row.active ? 'Sí' : 'No'];
    case 'repuestos': return [row.id, row.code, row.name, row.brand || '-', row.category || '-', '$' + row.price, row.quantityAvailable, row.minStock];
    case 'ordenes': return [row.id, row.vehicleId, row.mechanicId || '-', row.status, row.mileageIn + ' km'];
    case 'presupuestos': return [row.id, row.workOrderId, '$' + row.total, row.status, row.expiresAt];
    case 'inventario': return [row.id, row.partId, row.type, row.quantity, row.createdAt];
    case 'auditoria': return [row.id, row.userId || '-', row.action, row.entity, row.createdAt];
  }
}
