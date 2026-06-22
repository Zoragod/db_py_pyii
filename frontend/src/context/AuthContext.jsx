import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin } from '../utils/api';

// Roles y sus descripciones
export const ROLES = {
  ADMIN: {
    id: 'admin',
    nombre: 'Administrador de Flota',
    descripcion: 'Responsable máximo del proceso. Acceso total.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  OPERATOR: {
    id: 'operator',
    nombre: 'Operador de Flota / Encargado de Garaje',
    descripcion: 'Responsable de movimientos diarios, asignaciones y costos operativos.',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  MECHANIC: {
    id: 'mechanic',
    nombre: 'Jefe de Taller / Mecánico',
    descripcion: 'Equipo de Mantenimiento. Control de órdenes de servicio e insumos de taller.',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  WAREHOUSE: {
    id: 'warehouse',
    nombre: 'Apoyo Administrativo / Almacenero',
    descripcion: 'Control de inventario de repuestos y materiales.',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  DRIVER: {
    id: 'driver',
    nombre: 'Conductor / Chofer',
    descripcion: 'Operador de vehículo físico. Acceso restringido para registros diarios.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  }
};

// ponytail: sesión solo en memoria — recargar = volver al login
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [currentRole, setCurrentRole] = useState('admin');
  const [loading, setLoading] = useState(false);

  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);

      // Mapear rol del backend al id interno
      let roleId = 'driver';
      const rol = data.usuario?.rol || '';
      if (rol === 'ADMINISTRADOR') roleId = 'admin';
      else if (rol === 'OPERADOR')  roleId = 'operator';
      else if (rol === 'MECANICO')  roleId = 'mechanic';
      else if (rol === 'ALMACENERO') roleId = 'warehouse';

      setToken(data.token);
      setUser(data.usuario);
      setCurrentRole(roleId);

      // Guardar token en localStorage para las llamadas API siguientes
      localStorage.setItem('fv_token', data.token);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Usuario o contraseña incorrectos' };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('fv_token');
    setToken(null);
    setUser(null);
    setCurrentRole('admin');
  };

  const hasAccess = (moduleId) => {
    switch (currentRole) {
      case 'admin':    return true;
      case 'operator': return ['dashboard', 'catastro', 'operaciones', 'combustible', 'costos'].includes(moduleId);
      case 'mechanic': return ['mantenimiento', 'almacen'].includes(moduleId);
      case 'warehouse': return ['mantenimiento', 'almacen'].includes(moduleId);
      case 'driver':   return ['operaciones'].includes(moduleId);
      default:         return false;
    }
  };

  const canWrite = (action) => {
    if (currentRole === 'admin') return true;
    switch (action) {
      case 'EDIT_VEHICULOS':
      case 'EDIT_SECTORES':      return false;
      case 'EDIT_MOVIMIENTO':
      case 'EDIT_COMBUSTIBLE':   return ['operator', 'driver'].includes(currentRole);
      case 'APPROVE_COMBUSTIBLE': return currentRole === 'operator';
      case 'EDIT_OS':
      case 'EDIT_MANO_OBRA':
      case 'EDIT_LLANTAS':       return currentRole === 'mechanic';
      case 'EDIT_ALMACEN':
      case 'DESPACHAR_MATERIAL': return currentRole === 'warehouse';
      default:                   return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      currentRole,
      loginUser,
      logoutUser,
      hasAccess,
      canWrite,
      roleInfo: ROLES[currentRole.toUpperCase()]
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
