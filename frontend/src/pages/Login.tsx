import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api.authLogin({ email, password });
      if (data.token) {
        localStorage.setItem('boxmotor_token', data.token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales invalidas');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card form-card">
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1.2rem' }}>
          Iniciar sesion
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Correo electronico</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Contrasena</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={{ color: '#0f3d56', fontWeight: '600' }}>
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
}
