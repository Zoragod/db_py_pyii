const API_BASE = 'http://localhost:3000/api';

export interface UsuarioInfo {
  username: string;
  nombre: string;
  rol: string;
}

export function saveSession(token: string, usuario: UsuarioInfo) {
  localStorage.setItem('siafv_token', token);
  localStorage.setItem('siafv_user', JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem('siafv_token');
  localStorage.removeItem('siafv_user');
}

export function getSession(): { token: string | null; user: UsuarioInfo | null } {
  const token = localStorage.getItem('siafv_token');
  const userStr = localStorage.getItem('siafv_user');
  let user: UsuarioInfo | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }
  return { token, user };
}

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('siafv_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error en el servidor.');
  }
  return data;
}

export const api = {
  login: async (username: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    saveSession(data.token, data.usuario);
    return data;
  },

  getVehiculos: async () => {
    return request('/vehiculos');
  },

  createVehiculo: async (vehiculo: any) => {
    return request('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(vehiculo)
    });
  },

  getConductores: async () => {
    return request('/conductores');
  },

  createMovimiento: async (movimiento: any) => {
    return request('/movimientos', {
      method: 'POST',
      body: JSON.stringify(movimiento)
    });
  },

  getKpis: async (codigoVehiculo: string, mes: number, anio: number) => {
    return request(`/kpis/${codigoVehiculo}/${mes}/${anio}`);
  }
};
