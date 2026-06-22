import React, { useState } from 'react';
import { api } from '../api';
import { KeyRound, User, AlertCircle, Shield } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, ingresa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.usuario);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '36px',
        background: 'rgba(10, 16, 30, 0.55)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Header de la UI */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: 'var(--color-catastro)',
            marginBottom: '16px'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>SIAFV — Flotas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Inicia sesión para ingresar al sistema de control
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--color-costos)',
              fontSize: '13px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Usuario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px',
              marginTop: '10px',
              fontSize: '14.5px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

        {/* Demo info */}
        <div style={{
          marginTop: '28px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '8px',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <strong>Cuentas demo:</strong> admin / admin123 (Administrador) <br />
          conductor / conductor123 (Chofer)
        </div>
      </div>
    </div>
  );
};
