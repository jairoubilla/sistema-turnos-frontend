import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // ==========================================
  // 1. ESTADOS
  // ==========================================
  const [rol, setRol] = useState(null); 
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [vista, setVista] = useState('turnos'); 
  
  const [busquedaDni, setBusquedaDni] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  // Estados para formularios
  const [nuevoPaciente, setNuevoPaciente] = useState({ id: null, nombre: '', dni: '', telefono: '' });
  const [nuevoMedico, setNuevoMedico] = useState({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '' });
  const [nuevoTurno, setNuevoTurno] = useState({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });

  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [busquedaAdmin, setBusquedaAdmin] = useState('');

  // ==========================================
  // 2. CARGA DE DATOS
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
    } catch (err) { console.error("Error al cargar datos", err) }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { obtenerDatos() }, []);

  // ==========================================
  // 3. FUNCIONES DE GESTIÓN (PACIENTES)
  // ==========================================
  const guardarPaciente = async (e) => {
    e.preventDefault();
    const url = 'https://sisteme-turnos-backend-production.up.railway.app/pacientes';
    try {
      if (nuevoPaciente.id) {
        await axios.put(`${url}/${nuevoPaciente.id}`, nuevoPaciente);
        alert("Paciente actualizado");
      } else {
        await axios.post(url, nuevoPaciente);
        alert("Paciente registrado");
      }
      setNuevoPaciente({ id: null, nombre: '', dni: '', telefono: '' });
      setMostrarRegistro(false);
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al procesar paciente") }
  }

  const eliminarPaciente = async (id) => {
    if (window.confirm("¿Eliminar este paciente? Esto podría borrar sus turnos.")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/pacientes/${id}`);
        obtenerDatos();
      // eslint-disable-next-line no-unused-vars
      } catch (err) { alert("Error al eliminar") }
    }
  }

  // ==========================================
  // 4. FUNCIONES DE GESTIÓN (MÉDICOS)
  // ==========================================
  const guardarMedico = async (e) => {
    e.preventDefault();
    const url = 'https://sisteme-turnos-backend-production.up.railway.app/medicos';
    try {
      if (nuevoMedico.id) {
        await axios.put(`${url}/${nuevoMedico.id}`, nuevoMedico);
        alert("Médico actualizado");
      } else {
        await axios.post(url, nuevoMedico);
        alert("Médico registrado");
      }
      setNuevoMedico({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '' });
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al procesar médico") }
  }

  const eliminarMedico = async (id) => {
    if (window.confirm("¿Eliminar este médico?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/medicos/${id}`);
        obtenerDatos();
      // eslint-disable-next-line no-unused-vars
      } catch (err) { alert("Error al eliminar") }
    }
  }

  // ==========================================
  // 5. FUNCIONES DE GESTIÓN (TURNOS)
  // ==========================================
  const guardarTurno = async (e) => {
    e.preventDefault();
    // Forzamos el paciente_id si estamos en vista de paciente
    const datosFinales = { 
      ...nuevoTurno, 
      paciente_id: rol === 'paciente' ? pacienteEncontrado?.id : nuevoTurno.paciente_id 
    };

    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', datosFinales);
      alert("¡Turno agendado!");
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
      obtenerDatos();
    } catch (err) { 
      console.error(err.response?.data);
      alert("Error: Verifica que el médico y paciente existan, o el horario esté libre.");
    }
  }

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, { estado: nuevoEstado });
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al cambiar estado") }
  }

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar turno?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`);
        obtenerDatos();
      // eslint-disable-next-line no-unused-vars
      } catch (err) { alert("Error al borrar") }
    }
  }

  // ==========================================
  // 6. LÓGICA DE LOGIN Y FILTROS
  // ==========================================
  const buscarPaciente = () => {
    const encontrado = pacientes.find(p => p.dni === busquedaDni);
    if (encontrado) {
      setPacienteEncontrado(encontrado);
      setRol('paciente');
    } else {
      if (window.confirm("DNI no registrado. ¿Crear cuenta?")) {
        setNuevoPaciente({ ...nuevoPaciente, dni: busquedaDni });
        setMostrarRegistro(true);
      }
    }
  };

  const turnosFiltrados = turnos.filter(t =>
    t.paciente?.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
    t.medico?.toLowerCase().includes(busquedaAdmin.toLowerCase())
  );

  // ==========================================
  // 7. RENDERIZADO (INTERFAZ)
  // ==========================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>

      {!rol ? (
        /* ACCESO */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>🏥 AITurnos</h1>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            {!mostrarRegistro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3>Ingresar</h3>
                <input placeholder='Tu DNI' style={inputStyle} value={busquedaDni} onChange={(e) => setBusquedaDni(e.target.value)} />
                <button onClick={buscarPaciente} style={btnLarge}>Ingresar</button>
                <button onClick={() => setRol('admin_login')} style={{ background: 'none', color: '#4CAF50', border: 'none', cursor: 'pointer' }}>Acceso Admin</button>
              </div>
            ) : (
              <form onSubmit={guardarPaciente} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3>Crear Cuenta</h3>
                <input placeholder="Nombre" style={inputStyle} value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} required />
                <input value={busquedaDni} readOnly style={{...inputStyle, backgroundColor: '#444'}} />
                <input placeholder="WhatsApp" style={inputStyle} value={nuevoPaciente.telefono} onChange={(e) => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} required />
                <button type="submit" style={btnLarge}>Registrarme</button>
                <button onClick={() => setMostrarRegistro(false)} style={{ background: 'none', color: 'gray', border: 'none' }}>Volver</button>
              </form>
            )}
          </div>
        </div>
      ) : rol === 'admin_login' ? (
        /* LOGIN ADMIN */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            <h3>🔒 Clave Admin</h3>
            <input type="password" placeholder="Clave" style={inputStyle} value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} />
            <button onClick={() => passwordAdmin === 'admin123' ? (setRol('admin'), setAutenticado(true)) : alert("Error")} style={btnLarge}>Entrar</button>
            <button onClick={() => setRol(null)} style={{ background: 'none', color: 'gray', border: 'none', marginTop: '10px' }}>Cerrar</button>
          </div>
        </div>
      ) : (
        /* PANELES INTERNOS */
        <div>
          <button onClick={() => { setRol(null); setAutenticado(false); setPacienteEncontrado(null); }} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px', borderRadius: '5px', backgroundColor: '#444', color: 'white', border:'none' }}>⬅️ Salir</button>

          {rol === 'admin' && autenticado ? (
            /* --- PANEL ADMIN COMPLETO --- */
            <>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>📅 Turnos</button>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>👥 Pacientes</button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>👨‍⚕️ Médicos</button>
              </div>

              {/* VISTA TURNOS */}
              {vista === 'turnos' && (
                <section>
                  <input placeholder="🔍 Buscar..." style={{...inputStyle, width: '100%', marginBottom: '15px'}} onChange={(e) => setBusquedaAdmin(e.target.value)} />
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
                    <tbody>
                      {turnosFiltrados.map(t => (
                        <tr key={t.id}>
                          <td>{t.paciente}</td><td>{t.medico}</td><td>{t.fecha}</td>
                          <td>
                            <select value={t.estado} onChange={(e) => actualizarEstadoTurno(t.id, e.target.value)} style={selectEstadoStyle(t.estado)}>
                              <option value="Pendiente">Pendiente</option>
                              <option value="Confirmado">Confirmado</option>
                              <option value="Atendido">Atendido</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td><button onClick={() => eliminarTurno(t.id)} style={{color:'red', border:'none', background:'none'}}>Borrar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* VISTA PACIENTES (MODIFICAR Y ELIMINAR) */}
              {vista === 'pacientes' && (
                <section>
                  <h3>Gestión de Pacientes</h3>
                  <form onSubmit={guardarPaciente} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoPaciente.nombre} onChange={(e)=>setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
                    <input placeholder="DNI" style={inputStyle} value={nuevoPaciente.dni} onChange={(e)=>setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
                    <input placeholder="Teléfono" style={inputStyle} value={nuevoPaciente.telefono} onChange={(e)=>setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} />
                    <button type="submit" style={{backgroundColor:'#4CAF50', color:'white', padding:'10px'}}>{nuevoPaciente.id ? 'Actualizar' : 'Añadir'}</button>
                    {nuevoPaciente.id && <button onClick={()=>setNuevoPaciente({id:null, nombre:'', dni:'', telefono:''})}>Cancelar</button>}
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {pacientes.map(p => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td><td>{p.dni}</td><td>{p.telefono}</td>
                          <td>
                            <button onClick={() => setNuevoPaciente(p)} style={{color:'orange', marginRight:'10px'}}>Editar</button>
                            <button onClick={() => eliminarPaciente(p.id)} style={{color:'red'}}>Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {/* VISTA MÉDICOS (MODIFICAR Y ELIMINAR) */}
              {vista === 'medicos' && (
                <section>
                  <h3>Gestión de Staff Médico</h3>
                  <form onSubmit={guardarMedico} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoMedico.nombre} onChange={(e)=>setNuevoMedico({...nuevoMedico, nombre: e.target.value})} required />
                    <input placeholder="Especialidad" style={inputStyle} value={nuevoMedico.especialidad} onChange={(e)=>setNuevoMedico({...nuevoMedico, especialidad: e.target.value})} required />
                    <input placeholder="Matrícula" style={inputStyle} value={nuevoMedico.matricula} onChange={(e)=>setNuevoMedico({...nuevoMedico, matricula: e.target.value})} required />
                    <input placeholder="Teléfono" style={inputStyle} value={nuevoMedico.telefono} onChange={(e)=>setNuevoMedico({...nuevoMedico, telefono: e.target.value})} required />
                    <button type="submit" style={btnLarge}>{nuevoMedico.id ? 'Actualizar Médico' : 'Añadir Médico'}</button>
                    {nuevoMedico.id && <button onClick={()=>setNuevoMedico({id:null, nombre:'', especialidad:'', telefono:'', matricula:''})}>Cancelar</button>}
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Médico</th><th>Especialidad</th><th>Matrícula</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {medicos.map(m => (
                        <tr key={m.id}>
                          <td>{m.nombre}</td><td>{m.especialidad}</td><td>{m.matricula}</td>
                          <td>
                            <button onClick={() => setNuevoMedico(m)} style={{color:'orange', marginRight:'10px', background:'none', border:'none', cursor:'pointer'}}>Editar</button>
                            <button onClick={() => eliminarMedico(m.id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Borrar</button>
                          </td>
                        </tr>
                      ))}
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
                      <option value="">¿Con qué médico?</option>
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
                      <p>Dr. {t.medico}</p>
                      <p style={{fontSize:'12px', color: '#4CAF50'}}>{t.estado}</p>
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

// Estilos
const btnLarge = { padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#000' };
const btnTab = (active) => ({ padding: '10px 20px', cursor: 'pointer', backgroundColor: active ? '#4CAF50' : '#333', color: 'white', border: 'none', marginRight: '5px', borderRadius: '5px' });
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#333' };
const formStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const selectEstadoStyle = (estado) => ({ padding: '5px', borderRadius: '5px', backgroundColor: estado === 'Confirmado' ? '#2e7d32' : estado === 'Atendido' ? '#1565c0' : estado === 'Cancelado' ? '#c62828' : '#555', color: 'white', fontWeight: 'bold' });

export default App;