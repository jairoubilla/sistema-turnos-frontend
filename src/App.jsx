import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // ==========================================
  // 1. ESTADOS (Variables de la App)
  // ==========================================
  const [rol, setRol] = useState(null); 
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [vista, setVista] = useState('turnos'); 
  
  const [busquedaDni, setBusquedaDni] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', dni: '', telefono: '' });
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', especialidad: '', telefono: '', matricula: '' });
  const [nuevoTurno, setNuevoTurno] = useState({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });

  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [busquedaAdmin, setBusquedaAdmin] = useState('');

  // ==========================================
  // 2. FUNCIONES DE COMUNICACIÓN
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
  // 3. LÓGICA DE ACCESO
  // ==========================================
  const buscarPaciente = () => {
    const encontrado = pacientes.find(p => p.dni === busquedaDni);
    if (encontrado) {
      setPacienteEncontrado(encontrado);
      setNuevoTurno({ ...nuevoTurno, paciente_id: encontrado.id });
      setRol('paciente');
    } else {
      if (window.confirm("DNI no registrado. ¿Deseas crear una cuenta nueva?")) {
        setNuevoPaciente({ ...nuevoPaciente, dni: busquedaDni });
        setMostrarRegistro(true);
      }
    }
  };

  // ==========================================
  // 4. MANEJADORES DE GUARDADO Y ELIMINACIÓN
  // ==========================================
  const manejarCambio = (e) => setNuevoPaciente({ ...nuevoPaciente, [e.target.name]: e.target.value });
  const manejarCambioMedico = (e) => setNuevoMedico({ ...nuevoMedico, [e.target.name]: e.target.value });

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/pacientes', nuevoPaciente);
      alert("Registro exitoso. Ahora puedes ingresar.");
      setMostrarRegistro(false);
      obtenerDatos();
    } catch (err) { alert("Error al registrar") }
  }

  const guardarMedico = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/medicos', nuevoMedico);
      alert("Médico guardado");
      setNuevoMedico({ nombre: '', especialidad: '', telefono: '', matricula: '' });
      obtenerDatos();
    } catch (err) { alert("Error al guardar médico") }
  }

  const guardarTurno = async (e) => {
    e.preventDefault();
    const datosParaEnviar = { ...nuevoTurno, paciente_id: pacienteEncontrado?.id };
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', datosParaEnviar);
      alert("¡Turno agendado con éxito!");
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
      obtenerDatos();
    } catch (err) { alert("Error al agendar turno") }
  }

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar este turno?")) {
      try { await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`); obtenerDatos(); }
      catch (err) { alert("Error al eliminar") }
    }
  };

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, { estado: nuevoEstado });
      if(nuevoEstado === 'Atendido') alert("Turno finalizado");
      obtenerDatos();
    } catch (err) { alert("Error al actualizar estado") }
  }

  // ==========================================
  // 5. CÁLCULOS Y FILTROS
  // ==========================================
  const turnosFiltrados = turnos.filter(t =>
    t.paciente?.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
    t.medico?.toLowerCase().includes(busquedaAdmin.toLowerCase())
  );

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha === hoy).length;
  const turnosPendientes = turnos.filter(t => t.estado === 'Pendiente').length;
  const totalPacientes = pacientes.length;

  // ==========================================
  // 6. RENDERIZADO (UI)
  // ==========================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>

      {!rol ? (
        /* --- BLOQUE: ACCESO PRINCIPAL --- */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>🏥 AITurnos</h1>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            {!mostrarRegistro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3>Ingresar al Sistema</h3>
                <input placeholder='Tu DNI' style={inputStyle} value={busquedaDni} onChange={(e) => setBusquedaDni(e.target.value)} />
                <button onClick={buscarPaciente} style={btnLarge}>Ingresar</button>
                <hr style={{ width: '100%', opacity: 0.2 }} />
                <button onClick={() => setRol('admin_login')} style={{ background: 'none', color: '#4CAF50', border: 'none', cursor: 'pointer' }}>Acceso Admin</button>
              </div>
            ) : (
              <form onSubmit={guardarPaciente} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3>Crear Cuenta</h3>
                <input name="nombre" placeholder="Nombre Completo" style={inputStyle} onChange={manejarCambio} required />
                <input name="dni" value={busquedaDni} readOnly style={{...inputStyle, backgroundColor: '#444'}} />
                <input name="telefono" placeholder="WhatsApp" style={inputStyle} onChange={manejarCambio} required />
                <button type="submit" style={btnLarge}>Registrarme</button>
                <button onClick={() => setMostrarRegistro(false)} style={{ background: 'none', color: 'gray', border: 'none' }}>Volver</button>
              </form>
            )}
          </div>
        </div>
      ) : rol === 'admin_login' ? (
        /* --- BLOQUE: LOGIN SEGURO ADMIN --- */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            <h3>🔒 Clave Administrador</h3>
            <input type="password" placeholder="Clave" style={inputStyle} value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} />
            <button onClick={() => {
              if(passwordAdmin === 'admin123') { setRol('admin'); setAutenticado(true); } 
              else { alert("Clave incorrecta"); }
            }} style={btnLarge}>Validar</button>
            <button onClick={() => setRol(null)} style={{ background: 'none', color: 'gray', border: 'none', marginTop: '10px' }}>Volver</button>
          </div>
        </div>
      ) : (
        /* --- BLOQUE: PANELES INTERNOS --- */
        <div>
          <button onClick={() => { setRol(null); setAutenticado(false); setPacienteEncontrado(null); setPasswordAdmin(''); }} style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 15px', borderRadius: '5px', backgroundColor: '#444', color: 'white', border: 'none' }}>⬅️ Salir</button>

          {rol === 'admin' && autenticado ? (
            /* VISTA ADMIN */
            <>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={cardStyle}>Hoy: {turnosHoy}</div>
                <div style={cardStyle}>Pendientes: {turnosPendientes}</div>
                <div style={cardStyle}>Pacientes: {totalPacientes}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>📅 Turnos</button>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>👥 Pacientes</button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>👨‍⚕️ Médicos</button>
              </div>

              {vista === 'turnos' && (
                <section>
                  <input placeholder="🔍 Buscar..." style={{...inputStyle, width: '100%', marginBottom: '15px'}} onChange={(e) => setBusquedaAdmin(e.target.value)} />
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Estado</th><th>Borrar</th></tr></thead>
                    <tbody>
                      {turnosFiltrados.map(t => (
                        <tr key={t.id}>
                          <td>{t.paciente}</td><td>{t.medico}</td><td>{t.fecha}</td>
                          <td>
                            <select value={t.estado} onChange={(e) => actualizarEstadoTurno(t.id, e.target.value)} style={selectEstadoStyle(t.estado)}>
                              <option value="Pendiente">Pendiente</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Atendido">Atendido</option>
                            </select>
                          </td>
                          <td><button onClick={() => eliminarTurno(t.id)} style={{color:'red', border:'none', background:'none'}}>X</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'pacientes' && (
                <section>
                  <h3>Pacientes Registrados</h3>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th></tr></thead>
                    <tbody>
                      {pacientes.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{p.dni}</td><td>{p.telefono}</td></tr>)}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'medicos' && (
                <section>
                  <h3>Gestión de Médicos</h3>
                  <form onSubmit={guardarMedico} style={formStyle}>
                    <input name="nombre" placeholder="Nombre" onChange={manejarCambioMedico} required style={inputStyle} />
                    <input name="especialidad" placeholder="Especialidad" onChange={manejarCambioMedico} required style={inputStyle} />
                    <button type="submit" style={{backgroundColor:'#4CAF50', color:'white', padding:'10px', borderRadius:'5px'}}>Añadir</button>
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>Especialidad</th></tr></thead>
                    <tbody>
                      {medicos.map(m => <tr key={m.id}><td>{m.nombre}</td><td>{m.especialidad}</td></tr>)}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          ) : (
            /* VISTA PACIENTE */
            <section style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2>Hola, {pacienteEncontrado?.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Agendar Turno</h3>
                  <form onSubmit={guardarTurno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <select onChange={e => setNuevoTurno({ ...nuevoTurno, medico_id: e.target.value })} required style={inputStyle}>
                      <option value="">¿Médico?</option>
                      {medicos.map(m => (<option key={m.id} value={m.id} style={{color:'black'}}>{m.nombre} - {m.especialidad}</option>))}
                    </select>
                    <input type="date" onChange={e => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })} required style={inputStyle} />
                    <input type="time" onChange={e => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })} required style={inputStyle} />
                    <input placeholder="Motivo" onChange={e => setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })} required style={inputStyle} />
                    <button type="submit" style={btnLarge}>Confirmar</button>
                  </form>
                </div>
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Mis Turnos</h3>
                  {turnos.filter(t => t.paciente_id === pacienteEncontrado?.id).map(t => (
                    <div key={t.id} style={{ borderLeft: '4px solid #4CAF50', padding: '10px', backgroundColor: '#333', marginBottom: '10px' }}>
                      <p><b>{t.fecha} - {t.hora}hs</b></p>
                      <p style={{fontSize:'12px'}}>Estado: {t.estado}</p>
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

// Estilos al final
const btnLarge = { padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#000' };
const btnTab = (active) => ({ padding: '10px 20px', cursor: 'pointer', backgroundColor: active ? '#4CAF50' : '#333', color: 'white', border: 'none', marginRight: '5px', borderRadius: '5px' });
const cardStyle = { backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px', textAlign: 'center', flex: '1' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#333' };
const formStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const selectEstadoStyle = (estado) => ({ padding: '5px', borderRadius: '5px', backgroundColor: estado === 'Confirmado' ? '#2e7d32' : estado === 'Atendido' ? '#1565c0' : '#555', color: 'white', fontWeight: 'bold' });

export default App;