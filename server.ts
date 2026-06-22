import express, { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import prisma from './db'
import { Rol, Decimal } from './generated/prisma'

const app = express()
app.use(express.json())

// Middleware de CORS nativo (evita dependencias adicionales)
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

const JWT_SECRET = process.env.JWT_SECRET || 'siafv_super_secret_key_2026'

// ─── Interfaces Extendidas ────────────────────────────────────────────────────
interface AuthRequest extends Request {
  user?: {
    idUsuario: number
    username: string
    rol: Rol
    nombre: string
  }
}

// ─── Utilidades Criptográficas (Cero Dependencias) ────────────────────────────
function hashPassword(password: string): string {
  return crypto.createHmac('sha256', 'siafv_salt').update(password).digest('hex')
}

function signJwt(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url')
  return `${base64Header}.${base64Payload}.${signature}`
}

function verifyJwt(token: string): any {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, payload, signature] = parts
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')
  if (signature !== expectedSignature) return null
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

// ─── Middlewares de Seguridad (ValidarToken-API & RBAC) ───────────────────────
const validarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso denegado. Token no provisto.' })
    return
  }
  const token = authHeader.split(' ')[1]
  const decoded = verifyJwt(token)
  if (!decoded) {
    res.status(401).json({ error: 'Token inválido o expirado.' })
    return
  }
  req.user = decoded
  next()
}

const permitirRoles = (...roles: Rol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Acceso prohibido. Permisos insuficientes.' })
      return
    }
    next()
  }
}

// ─── Setup Inicial Autocurativo (Usuarios por Defecto) ────────────────────────
async function setupDefaultUsers(): Promise<void> {
  console.log('Verificando usuarios por defecto en base de datos...')
  const users = [
    { username: 'admin', password: 'admin123', nombre: 'Administrador de Flota', rol: Rol.ADMINISTRADOR },
    { username: 'conductor', password: 'conductor123', nombre: 'Juan Pérez (Chofer)', rol: Rol.CONDUCTOR, matriculaConductor: 'COND-001' },
    { username: 'operador', password: 'operador123', nombre: 'Jorge Valdivia (Operador)', rol: Rol.OPERADOR },
    { username: 'mecanico', password: 'mecanico123', nombre: 'Manuel Castro (Mecánico)', rol: Rol.MECANICO, matriculaMecanico: 'MEC-001' },
    { username: 'almacenero', password: 'almacenero123', nombre: 'Augusto López (Almacenero)', rol: Rol.ALMACENERO }
  ]
  for (const u of users) {
    const exists = await prisma.usuario.findUnique({ where: { username: u.username } })
    if (!exists) {
      await prisma.usuario.create({
        data: {
          username: u.username,
          password: hashPassword(u.password),
          nombre: u.nombre,
          rol: u.rol,
          matriculaConductor: u.matriculaConductor || null,
          matriculaMecanico: u.matriculaMecanico || null
        }
      })
      console.log(`  [+] Usuario "${u.username}" (${u.password}) creado.`)
    }
  }
}

app.get('/', (req: Request, res: Response) => {
  res.json({
    estado: 'Servidor SIAFV Activo',
    mensaje: 'La API está corriendo. Usa los endpoints de /api para interactuar.',
    endpoints_disponibles: {
      autenticacion: 'POST /api/auth/login',
      vehiculos: 'GET /api/vehiculos, POST /api/vehiculos',
      conductores: 'GET /api/conductores',
      operaciones: 'POST /api/movimientos (checklists), POST /api/abastecimientos',
      mantenimiento: 'POST /api/ordenes-servicio',
      kpis_calculos: 'GET /api/kpis/:codigoVehiculo/:mes/:anio'
    }
  })
})

// ─── 1. Endpoints de Autenticación ────────────────────────────────────────────

// InicioSesion-API
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'Usuario y contraseña son requeridos.' })
    return
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { username } })
    if (!usuario || usuario.password !== hashPassword(password)) {
      res.status(401).json({ error: 'Credenciales inválidas.' })
      return
    }
    if (!usuario.activo) {
      res.status(403).json({ error: 'Usuario inactivo.' })
      return
    }
    const token = signJwt({
      idUsuario: usuario.idUsuario,
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombre,
    })
    res.json({
      token,
      usuario: {
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ─── 2. Endpoints de Catastro e Inventario ────────────────────────────────────

// Listar vehículos
app.get('/api/vehiculos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { sector: true },
    })
    res.json(vehiculos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar vehículo (Admin únicamente)
app.post('/api/vehiculos', validarToken, permitirRoles(Rol.ADMINISTRADOR), async (req: AuthRequest, res: Response) => {
  try {
    const { codigoVehiculo, placaRodaje, marca, modelo, anoFabricacion, capacidadCargaKg, idSectorAsignado, valorAdquisicion, valorResidual, vidaUtilAnos } = req.body
    const nuevo = await prisma.vehiculo.create({
      data: {
        codigoVehiculo,
        placaRodaje,
        marca,
        modelo,
        anoFabricacion,
        capacidadCargaKg: new Decimal(capacidadCargaKg),
        idSectorAsignado,
        valorAdquisicion: valorAdquisicion ? new Decimal(valorAdquisicion) : null,
        valorResidual: valorResidual ? new Decimal(valorResidual) : null,
        vidaUtilAnos,
      },
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Listar conductores
app.get('/api/conductores', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const conductores = await prisma.conductor.findMany()
    res.json(conductores)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ─── 3. Endpoints de Operación y Movimientos ──────────────────────────────────

// MA122_01_01: Bitácora Digital y Lista de Verificación Diaria (Checklist)
app.post('/api/movimientos', validarToken, permitirRoles(Rol.ADMINISTRADOR, Rol.OPERADOR, Rol.CONDUCTOR), async (req: AuthRequest, res: Response) => {
  try {
    const {
      codigoVehiculo,
      matriculaConductor,
      fechaMovimiento,
      horaSalida,
      horaLlegada,
      kmSalida,
      kmLlegada,
      destino,
      chkLuces,
      chkFrenos,
      chkFluidos,
      chkLlantas,
      chkDocumentos,
      checklistObservaciones,
    } = req.body

    const movimiento = await prisma.movimientoDiario.create({
      data: {
        codigoVehiculo,
        matriculaConductor,
        fechaMovimiento: new Date(fechaMovimiento),
        horaSalida: new Date(horaSalida),
        horaLlegada: horaLlegada ? new Date(horaLlegada) : null,
        kmSalida: new Decimal(kmSalida),
        kmLlegada: kmLlegada ? new Decimal(kmLlegada) : null,
        destino,
        chkLuces: chkLuces !== undefined ? chkLuces : true,
        chkFrenos: chkFrenos !== undefined ? chkFrenos : true,
        chkFluidos: chkFluidos !== undefined ? chkFluidos : true,
        chkLlantas: chkLlantas !== undefined ? chkLlantas : true,
        chkDocumentos: chkDocumentos !== undefined ? chkDocumentos : true,
        checklistObservaciones,
      },
    })
    res.status(201).json(movimiento)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// MA122_01_02: Orden de Abastecimiento de Combustible
app.post('/api/abastecimientos', validarToken, permitirRoles(Rol.ADMINISTRADOR, Rol.OPERADOR, Rol.CONDUCTOR), async (req: AuthRequest, res: Response) => {
  try {
    const { idMovimiento, idServicentro, tipoCombustible, galonesAbastecidos, kilometrajeActual } = req.body
    const orden = await prisma.ordenAbastecimiento.create({
      data: {
        idMovimiento,
        idServicentro,
        tipoCombustible,
        galonesAbastecidos: new Decimal(galonesAbastecidos),
        kilometrajeActual: new Decimal(kilometrajeActual),
      },
    })
    res.status(201).json(orden)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// ─── 4. Endpoints de Mantenimiento Técnico ────────────────────────────────────

// MA122_02_01: Orden de Servicio de Taller Propio
app.post('/api/ordenes-servicio', validarToken, permitirRoles(Rol.ADMINISTRADOR, Rol.MECANICO), async (req: AuthRequest, res: Response) => {
  try {
    const { codigoVehiculo, fechaEmision, tipoMantenimiento, kmEntrada } = req.body
    const os = await prisma.ordenServicioTaller.create({
      data: {
        codigoVehiculo,
        fechaEmision: new Date(fechaEmision),
        tipoMantenimiento,
        kmEntrada: new Decimal(kmEntrada),
      },
    })
    res.status(201).json(os)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// ─── 5. Endpoints Financieros e Indicadores de Gestión (KPIs) ──────────────────

// MA122_03_01 & Calc_Indicadores: Cálculo de Indicadores (CKV, IUV, Depreciación)
app.get('/api/kpis/:codigoVehiculo/:mes/:anio', validarToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { codigoVehiculo, mes, anio } = req.params
  const nMes = parseInt(mes, 10)
  const nAnio = parseInt(anio, 10)

  try {
    // 1. Obtener datos del vehículo
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { codigoVehiculo },
    })

    if (!vehiculo) {
      res.status(404).json({ error: 'Vehículo no encontrado.' })
      return
    }

    // 2. Calcular Depreciación Lineal Mensual (Ecuación 2 del Manual)
    // D = (V - R) / (12 * N)
    let depreciacionMensual = 0
    if (vehiculo.valorAdquisicion && vehiculo.valorResidual && vehiculo.vidaUtilAnos) {
      const V = Number(vehiculo.valorAdquisicion)
      const R = Number(vehiculo.valorResidual)
      const N = vehiculo.vidaUtilAnos
      depreciacionMensual = (V - R) / (12 * N)
    }

    // 3. Obtener el consolidado mensual de costos (si ya existe cerrado)
    const consolidado = await prisma.controlMensualCosto.findUnique({
      where: {
        codigoVehiculo_mesReferencia_anioReferencia: {
          codigoVehiculo,
          mesReferencia: nMes,
          anioReferencia: nAnio,
        },
      },
    })

    // 4. Calcular CKV (Costo por Kilómetro de Operación - Ecuación 1)
    // CKV = (CFP + CFV) / K + CVV
    // Si no hay consolidado, estimamos basándonos en movimientos del mes.
    const movimientosMes = await prisma.movimientoDiario.findMany({
      where: {
        codigoVehiculo,
        fechaMovimiento: {
          gte: new Date(nAnio, nMes - 1, 1),
          lt: new Date(nAnio, nMes, 1),
        },
      },
    })

    let totalKms = 0
    let totalHoras = 0
    for (const m of movimientosMes) {
      if (m.kmSalida && m.kmLlegada) {
        totalKms += Number(m.kmLlegada) - Number(m.kmSalida)
      }
      if (m.horaSalida && m.horaLlegada) {
        const diffMs = m.horaLlegada.getTime() - m.horaSalida.getTime()
        totalHoras += diffMs / (1000 * 60 * 60)
      }
    }

    // Parámetros por defecto según manual técnico (ejemplo en página 11)
    const CFP = consolidado ? Number(consolidado.costoFijoProrrateado) : 100.0 // CFP fijo estimado
    const CFV = depreciacionMensual + 50.0 // Depreciación + estimación de seguros y licencias
    const costoVariableTotal = consolidado ? Number(consolidado.costoVariable) : 350.0 // Combustible + mantenimientos

    const CKV = totalKms > 0 ? (CFP + CFV + costoVariableTotal) / totalKms : 0

    // 5. Calcular IUV (Índice de Utilización del Vehículo - Ecuación 10)
    // IUV = ((KRV / KRP) + (HUV / HUP)) / 2
    // Valores patrón por defecto si no están definidos
    const KRP = 2000.0 // Kilometraje mensual de referencia
    const HUP = 160.0  // Horas mensuales de referencia (8h/día * 20 días útiles)
    const KRV = totalKms
    const HUV = totalHoras

    const IUV = ((KRV / KRP) + (HUV / HUP)) / 2

    res.json({
      codigoVehiculo,
      periodo: `${mes}/${anio}`,
      utilizacionRendimiento: {
        kilometrosRecorridos: totalKms,
        horasUso: totalHoras,
      },
      indicadores: {
        depreciacionMensual: parseFloat(depreciacionMensual.toFixed(2)),
        costoPorKilometro: parseFloat(CKV.toFixed(4)),
        indiceUtilizacion: parseFloat((IUV * 100).toFixed(2)), // En porcentaje
        estadoServicio: IUV >= 1.0 ? 'SERVICIO PERMANENTE' : 'SERVICIO EVENTUAL / USO COMÚN',
      },
    })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ─── 6. Endpoints Adicionales para Sincronización Frontend-Backend ────────────

// Obtener sectores
app.get('/api/sectores', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const sectores = await prisma.sectorSolicitante.findMany()
    res.json(sectores)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar conductor (Admin únicamente)
app.post('/api/conductores', validarToken, permitirRoles(Rol.ADMINISTRADOR), async (req: AuthRequest, res: Response) => {
  try {
    const { matriculaConductor, nombreConductor, documentoIdentidad } = req.body
    const nuevo = await prisma.conductor.create({
      data: { matriculaConductor, nombreConductor, documentoIdentidad }
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Obtener todos los movimientos
app.get('/api/movimientos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const movimientos = await prisma.movimientoDiario.findMany()
    res.json(movimientos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener abastecimientos
app.get('/api/abastecimientos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const abastecimientos = await prisma.ordenAbastecimiento.findMany()
    res.json(abastecimientos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener ordenes de servicio
app.get('/api/ordenes-servicio', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const ordenes = await prisma.ordenServicioTaller.findMany()
    res.json(ordenes)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener mecanicos
app.get('/api/mecanicos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const mecanicos = await prisma.mecanico.findMany()
    res.json(mecanicos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener servicentros
app.get('/api/servicentros', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const servicentros = await prisma.servicentroAcreditado.findMany()
    res.json(servicentros)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener repuestos
app.get('/api/repuestos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const repuestos = await prisma.repuestoAlmacen.findMany()
    res.json(repuestos)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener llantas
app.get('/api/llantas', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const llantas = await prisma.llantaOConjunto.findMany()
    res.json(llantas)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener historial llantas
app.get('/api/historial-llantas', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const historial = await prisma.historialFichaControl.findMany()
    res.json(historial)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar instalación llanta
app.post('/api/historial-llantas', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { numeroFabrica, codigoVehiculo, fechaInstalacion, kmInstalacion, posicionRueda } = req.body
    const nuevo = await prisma.historialFichaControl.create({
      data: {
        numeroFabrica,
        codigoVehiculo,
        fechaInstalacion: new Date(fechaInstalacion),
        kmInstalacion: new Decimal(kmInstalacion),
        posicionRueda
      }
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Obtener mano de obra
app.get('/api/mano-obra', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const manoObra = await prisma.tarjetaManoObra.findMany()
    res.json(manoObra)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar mano de obra
app.post('/api/mano-obra', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { numeroOs, matriculaMecanico, fechaTrabajo, codigoServicioEjecutado, horaInicio, horaFinal } = req.body
    const nuevo = await prisma.tarjetaManoObra.create({
      data: {
        numeroOs,
        matriculaMecanico,
        fechaTrabajo: new Date(fechaTrabajo),
        codigoServicioEjecutado,
        horaInicio: new Date(horaInicio),
        horaFinal: new Date(horaFinal)
      }
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Obtener detalles materiales
app.get('/api/detalles-materiales', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const detalles = await prisma.detalleSolicitudMaterial.findMany()
    res.json(detalles)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar solicitud materiales
app.post('/api/detalles-materiales', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { numeroOs, codigoRepuesto, cantidad, costoTotalRepuesto } = req.body
    const nuevo = await prisma.detalleSolicitudMaterial.create({
      data: {
        numeroOs,
        codigoRepuesto,
        cantidad: new Decimal(cantidad),
        costoTotalRepuesto: new Decimal(costoTotalRepuesto)
      }
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Obtener talleres
app.get('/api/talleres', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const talleres = await prisma.tallerTerceros.findMany()
    res.json(talleres)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Obtener servicios externos
app.get('/api/servicios-externos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const servicios = await prisma.autorizacionServicioExterno.findMany()
    res.json(servicios)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Registrar servicio externo
app.post('/api/servicios-externos', validarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { numeroOs, idTallerTercero, fechaEmision, fechaEntradaTaller, kmEntrada, fechaSalidaTaller, kmSalida, fechaAprobacion } = req.body
    const nuevo = await prisma.autorizacionServicioExterno.create({
      data: {
        numeroOs,
        idTallerTercero,
        fechaEmision: new Date(fechaEmision),
        fechaEntradaTaller: fechaEntradaTaller ? new Date(fechaEntradaTaller) : null,
        kmEntrada: kmEntrada ? new Decimal(kmEntrada) : null,
        fechaSalidaTaller: fechaSalidaTaller ? new Date(fechaSalidaTaller) : null,
        kmSalida: kmSalida ? new Decimal(kmSalida) : null,
        fechaAprobacion: fechaAprobacion ? new Date(fechaAprobacion) : null
      }
    })
    res.status(201).json(nuevo)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

// Port principal
const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  console.log(`\n======================================================`)
  console.log(`  SIAFV Backend Server running on http://localhost:${PORT}`)
  console.log(`======================================================`)
  await setupDefaultUsers()
})
