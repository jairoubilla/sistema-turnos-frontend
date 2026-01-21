import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // ==========================================
  // 1. ESTADOS (Variables de la App)
  // ==========================================
  const [rol, setRol] = useState(null); // Controla si es 'admin' o 'paciente'
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [vista, setVista] = useState('pacientes'); // Tab activa en Admin
  
  // Estados para Login y Registro
  const [busquedaDni, setBusquedaDni] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // Formularios de datos vacíos
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', dni: '', telefono: '' });
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', especialidad: '', telefono: '', matricula: '' });
  const [nuevoTurno, setNuevoTurno] = useState({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });

  // Formulario de contraseñas
  const [passwordAdmin, setPasswordAdmin] = useState('')
  const [autenticado, setAutenticado] = useState(false)

  // Formulario Busqueda en tiempo real
  const [busquedaAdmin, setBusquedaAdmin] = useState('')
  
  // ==========================================
  // 2. FUNCIONES DE COMUNICACIÓN (Backend)
  // ==========================================
  const obtenerDatos = async () => {
    try {
      const baseUrl = 'https://sisteme-turnos-backend-production.up.railway.app';
      const [resP, resM, resT] = await Promise.all([
        axios.get(`${baseUrl}/pacientes`),
        axios.get(`${baseUrl}/medicos`),
        axios.get(`${baseUrl}/turnos`)
      ]);
      setPacientes(resP.data);
      setMedicos(resM.data);
      setTurnos(resT.data);
    } catch (err) { console.error("Error al cargar datos: ", err) }
  }

  useEffect(() => { obtenerDatos() }, []);

  // ==========================================
  // 3. LÓGICA DE ACCESO (Login/Busqueda)
  // ==========================================
  const buscarPaciente = () => {
    const encontrado = pacientes.find(p => p.dni === busquedaDni);
    if (encontrado) {
      setPacienteEncontrado(encontrado);
      setNuevoTurno({ ...nuevoTurno, paciente_id: encontrado.id });
      setRol('paciente'); // Loguea al paciente
    } else {
      if (window.confirm("DNI no registrado. ¿Deseas crear una cuenta nueva?")) {
        setNuevoPaciente({ ...nuevoPaciente, dni: busquedaDni });
        setMostrarRegistro(true);
      }
    }
  };

  // ==========================================
  // 4. MANEJADORES DE GUARDADO
  // ==========================================
  const guardarPaciente = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/pacientes', nuevoPaciente);
      alert("Registro exitoso. Ahora puedes ingresar.");
      setMostrarRegistro(false);
      obtenerDatos();
    } catch (err) { alert("Error al registrar") }
  }

  const guardarTurno = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', nuevoTurno);
      alert("¡Turno agendado con éxito!");
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '' });
      obtenerDatos();
    } catch (err) { alert("Error al agendar: Verifica disponibilidad") }
  }

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar este turno?")) {
      try { await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`); obtenerDatos(); }
      catch (err) { alert("Error al eliminar") }
    }
  };

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
      // 1. Enviamos la actualización al backend en Railway
      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, { 
        estado: nuevoEstado 
      })
    
      // 2. Si se atendió o canceló, podrías mostrar un mensaje especial
      if(nuevoEstado === 'Atendido') {
        alert("Turno finalizado y movido al historial")
      }

      obtenerDatos(); // Recargamos todo para ver los cambios
    } catch (err) {
      alert("Error al actualizar el estado");
      console.error(err)
    }
  }

  // Filtramos los turnos para mostrar solo los del paciente actual
  const turnosDelPaciente = turnos.filter(t => t.paciente_id === pacienteEncontrado?.id)

  const turnosFiltrados = turnos.filter(t =>
    t.paciente.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
    t.medico.toLowerCase().includes(busquedaAdmin.toLowerCase())
  )

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0]

  // Cálculos rápidos
  const turnosHoy = turnos.filter(t => t.fecha === hoy).length
  const turnosPendientes = turnos.filter(t => t.estado === 'Pendiente').length
  const totalPacientes = pacientes.length

// ==========================================
  // 5. RENDERIZADO DE LA INTERFAZ (UI)
  // ==========================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>

      {/* 🟢 BLOQUE 1: PANTALLA DE ACCESO (LOGIN / REGISTRO) */}
      {!rol ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>🏥 AITurnos</h1>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            
            {!mostrarRegistro ? (
              /* SUB-BLOQUE: LOGIN POR DNI O ACCESO ADMIN */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3>Ingresar al Sistema</h3>
                <input placeholder='Tu DNI' style={inputStyle} value={busquedaDni} onChange={(e) => setBusquedaDni(e.target.value)} />
                <button onClick={buscarPaciente} style={btnLarge}>Ingresar</button>
                <hr style={{ width: '100%', opacity: 0.2 }} />
                
                {/* Botón para activar el modo Password de Admin */}
                <button onClick={() => setRol('admin_login')} style={{ background: 'none', color: '#4CAF50', border: 'none', cursor: 'pointer' }}>Acceso Admin</button>
              </div>
            ) : (
              /* SUB-BLOQUE: FORMULARIO DE REGISTRO PARA PACIENTES NUEVOS */
              <form onSubmit={guardarPaciente} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3>Crear Cuenta</h3>
                <input placeholder="Nombre Completo" style={inputStyle} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} required />
                <input value={busquedaDni} readOnly style={{...inputStyle, backgroundColor: '#444'}} />
                <input placeholder="WhatsApp (Ej: 261...)" style={inputStyle} onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} required />
                <button type="submit" style={btnLarge}>Registrarme</button>
                <button onClick={() => setMostrarRegistro(false)} style={{ background: 'none', color: 'gray', border: 'none' }}>Volver</button>
              </form>
            )}
          </div>
        </div>
      ) : rol === 'admin_login' ? (
        /* --- BLOQUE 2: SEGURIDAD PARA ENTRAR COMO ADMIN --- */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            <h3>🔒 Clave de Administrador</h3>
            <input type="password" placeholder="Clave" style={inputStyle} value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} />
            <button onClick={() => passwordAdmin === 'admin123' ? setRol('admin') : alert("Clave incorrecta")} style={btnLarge}>Validar</button>
            <button onClick={() => setRol(null)} style={{ background: 'none', color: 'gray', border: 'none', marginTop: '10px' }}>Volver</button>
          </div>
        </div>
      ) : (
        /* --- BLOQUE 3: VISTAS INTERNAS (CUANDO YA ENTRASTE) --- */
        <div>
          <button onClick={() => { setRol(null); setPacienteEncontrado(null); setBusquedaDni(''); setPasswordAdmin(''); }} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 15px', borderRadius: '5px', backgroundColor: '#444', color: 'white', border: 'none' }}>⬅️ Salir</button>

          {rol === 'admin' ? (
            /* ==========================================
              VISTA ADMINISTRADOR: PANEL COMPLETO
               ========================================== */
            <>
              {/* INDICADORES RÁPIDOS */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...cardStyle, borderTop: '5px solid #4CAF50' }}>Hoy: {turnosHoy}</div>
                <div style={{ ...cardStyle, borderTop: '5px solid #FFC107' }}>Pendientes: {turnosPendientes}</div>
                <div style={{ ...cardStyle, borderTop: '5px solid #2196F3' }}>Total Pacientes: {totalPacientes}</div>
              </div>

              {/* MENÚ DE PESTAÑAS */}
              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>📅 Turnos</button>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>👥 Pacientes</button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>👨‍⚕️ Médicos</button>
              </div>

              {/* TABLA DE TURNOS (CON COLORES Y BUSCADOR) */}
              {vista === 'turnos' && (
                <section>
                  <input placeholder="🔍 Buscar por nombre..." style={{...inputStyle, width: '100%', marginBottom: '15px', color: 'black'}} onChange={(e) => setBusquedaAdmin(e.target.value)} />
                  <table border="1" style={tableStyle}>
                    <thead>
                      <tr><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {turnosFiltrados.map(t => (
                        <tr key={t.id} style={{ opacity: t.estado === 'Atendido' ? 0.6 : 1 }}>
                          <td>{t.paciente}</td><td>{t.medico}</td><td>{t.fecha} - {t.hora}</td>
                          <td>
                            <select value={t.estado} onChange={(e) => actualizarEstadoTurno(t.id, e.target.value)} style={selectEstadoStyle(t.estado)}>
                              <option value="Pendiente">Pendiente</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Atendido">Atendido ✅</option>
                              <option value="Cancelado">Cancelado ❌</option>
                            </select>
                          </td>
                          <td><button onClick={() => eliminarTurno(t.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Borrar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
              {/* Aquí puedes re-pegar tus tablas de Pacientes y Médicos para el Admin */}
            </>
          ) : (
            /*==========================================
              VISTA PACIENTE: RESERVA Y MIS TURNOS
              ========================================== */
            <section style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2>Hola, {pacienteEncontrado?.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* AGENDAR */}
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Agendar Nuevo Turno</h3>
                  <form onSubmit={guardarTurno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <select value={nuevoTurno.medico_id} onChange={e => setNuevoTurno({ ...nuevoTurno, medico_id: e.target.value })} required style={inputStyle}>
                      <option value="">¿Médico?</option>
                      {medicos.map(m => (<option key={m.id} value={m.id} style={{color:'black'}}>{m.nombre} - {m.especialidad}</option>))}
                    </select>
                    <input type="date" value={nuevoTurno.fecha} onChange={e => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })} required style={inputStyle} />
                    <input type="time" value={nuevoTurno.hora} onChange={e => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })} required style={inputStyle} />
                    <input placeholder="Motivo" value={nuevoTurno.motivo} onChange={e => setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })} required style={inputStyle} />
                    <button type="submit" style={btnLarge}>Confirmar Turno</button>
                  </form>
                </div>

                {/* MIS TURNOS */}
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Mis Turnos</h3>
                  {turnos.filter(t => t.paciente_id === pacienteEncontrado?.id).map(t => (
                    <div key={t.id} style={{ borderLeft: '4px solid #4CAF50', padding: '10px', backgroundColor: '#333', marginBottom: '10px' }}>
                      <p style={{ margin: 0 }}><b>{t.fecha} - {t.hora}hs</b></p>
                      <p style={{ margin: 0, fontSize: '14px' }}>Dr. {t.medico}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#4CAF50' }}>{t.estado}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 6. ESTILOS VISUALES (Diseño)
// ==========================================

// Estilo para los botones grandes (Login y Confirmar)
const btnLarge = { 
  padding: '15px', 
  fontSize: '16px', 
  backgroundColor: '#4CAF50', 
  color: 'white', 
  border: 'none', 
  borderRadius: '10px', 
  cursor: 'pointer',
  fontWeight: 'bold'
};

// Estilo para los inputs (DNI, Fecha, etc.)
const inputStyle = { 
  padding: '12px', 
  borderRadius: '8px', 
  border: 'none', 
  backgroundColor: '#fff', 
  color: '#000',
  fontSize: '16px' 
};

// Estilo para las pestañas de navegación (Admin)
const btnTab = (active) => ({ 
  padding: '10px 20px', 
  cursor: 'pointer', 
  backgroundColor: active ? '#4CAF50' : '#333', 
  color: 'white', 
  border: 'none', 
  marginRight: '5px', 
  borderRadius: '5px',
  transition: '0.3s'
});

// Estilo para las tarjetas de estadísticas
const cardStyle = {
  backgroundColor: '#2a2a2a',
  padding: '15px',
  borderRadius: '10px',
  textAlign: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  flex: '1'
};

// Estilo para las tablas
const tableStyle = { 
  width: '100%', 
  borderCollapse: 'collapse', 
  textAlign: 'left', 
  backgroundColor: '#333',
  marginTop: '10px'
};

// Función para cambiar colores del selector de ESTADO según lo que elijas
const selectEstadoStyle = (estado) => ({
  padding: '5px',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
  backgroundColor: 
    estado === 'Confirmado' ? '#2e7d32' : 
    estado === 'Atendido' ? '#1565c0' : 
    estado === 'Cancelado' ? '#c62828' : '#555',
  color: 'white'
});

// Estilo general para los formularios del Admin
const formStyle = { 
  display: 'flex', 
  gap: '10px', 
  marginBottom: '20px', 
  flexWrap: 'wrap' 
};