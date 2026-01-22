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
  // 3. FUNCIONES DE GESTIÓN
  // ==========================================
  const guardarPaciente = async (e) => {
    e.preventDefault();
    const datosLimpios = { nombre: nuevoPaciente.nombre, dni: nuevoPaciente.dni, telefono: nuevoPaciente.telefono };
    const urlBase = 'https://sisteme-turnos-backend-production.up.railway.app/pacientes';
    try {
      if (nuevoPaciente.id) { await axios.put(`${urlBase}/${nuevoPaciente.id}`, datosLimpios); alert("Actualizado"); }
      else { await axios.post(urlBase, datosLimpios); alert("Registrado"); }
      setNuevoPaciente({ id: null, nombre: '', dni: '', telefono: '' });
      setMostrarRegistro(false);
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error en paciente") }
  };

  const guardarMedico = async (e) => {
    e.preventDefault();
    const datosParaEnviar = { nombre: nuevoMedico.nombre, especialidad: nuevoMedico.especialidad, matricula: nuevoMedico.matricula, telefono: nuevoMedico.telefono };
    const url = 'https://sisteme-turnos-backend-production.up.railway.app/medicos';
    try {
      if (nuevoMedico.id) { await axios.put(`${url}/${nuevoMedico.id}`, datosParaEnviar); }
      else { await axios.post(url, datosParaEnviar); }
      alert("Médico procesado");
      setNuevoMedico({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '' });
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error en médico") }
  };

  const guardarTurno = async (e) => {
    e.preventDefault();
    const datosFinales = { 
      ...nuevoTurno, 
      paciente_id: Number(pacienteEncontrado?.id) 
    };
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', datosFinales);
      alert("¡Turno agendado!");
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al agendar") }
  };

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, { estado: nuevoEstado });
      obtenerDatos();
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al cambiar estado") }
  };

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar turno?")) {
      try { await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`); obtenerDatos(); }
      // eslint-disable-next-line no-unused-vars
      catch (err) { alert("Error al borrar") }
    }
  };

  const enviarRecordatorio = (turno) => {
    const mensaje = `Hola ${turno.paciente}, te recordamos tu turno con el Dr. ${turno.medico} el día ${turno.fecha} a las ${turno.hora}hs.`;
    const url = `https://wa.me/${turno.telefono_paciente}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const buscarPaciente = () => {
    const encontrado = pacientes.find(p => p.dni === busquedaDni);
    if (encontrado) { setPacienteEncontrado(encontrado); setRol('paciente'); }
    else if (window.confirm("DNI no registrado. ¿Crear cuenta?")) {
      setNuevoPaciente({ ...nuevoPaciente, dni: busquedaDni });
      setMostrarRegistro(true);
    }
  };

  const turnosFiltrados = turnos.filter(t =>
    t.paciente?.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
    t.medico?.toLowerCase().includes(busquedaAdmin.toLowerCase())
  );

  // ==========================================
  // 4. RENDERIZADO
  // ==========================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      
      {!rol ? (
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
                <input placeholder="Nombre" style={inputStyle} value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} required />
                <input value={busquedaDni} readOnly style={{ ...inputStyle, backgroundColor: '#444' }} />
                <input placeholder="WhatsApp" style={inputStyle} value={nuevoPaciente.telefono} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })} required />
                <button type="submit" style={btnLarge}>Registrarme</button>
                <button onClick={() => setMostrarRegistro(false)} style={{ background: 'none', color: 'gray', border: 'none' }}>Volver</button>
              </form>
            )}
          </div>
        </div>
      ) : rol === 'admin_login' ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            <h3>🔒 Clave Admin</h3>
            <input type="password" placeholder="Clave" style={inputStyle} value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} />
            <button onClick={() => passwordAdmin === 'admin123' ? (setRol('admin'), setAutenticado(true)) : alert("Error")} style={btnLarge}>Entrar</button>
            <button onClick={() => setRol(null)} style={{ background: 'none', color: 'gray', border: 'none', marginTop: '10px' }}>Cerrar</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => { setRol(null); setAutenticado(false); setPacienteEncontrado(null); }} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px', borderRadius: '5px', backgroundColor: '#444', color: 'white', border: 'none' }}>⬅️ Salir</button>

          {rol === 'admin' && autenticado ? (
            <>
              {/* ESTADÍSTICAS */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ ...cardStyle, borderTop: '5px solid #4CAF50' }}>Hoy: {turnos.filter(t => t.fecha === new Date().toISOString().split('T')[0]).length}</div>
                <div style={{ ...cardStyle, borderTop: '5px solid #FFC107' }}>Pendientes: {turnos.filter(t => t.estado === 'Pendiente').length}</div>
                <div style={{ ...cardStyle, borderTop: '5px solid #2196F3' }}>Pacientes: {pacientes.length}</div>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>📅 Turnos</button>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>👥 Pacientes</button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>👨‍⚕️ Médicos</button>
              </div>

              {vista === 'turnos' && (
                <section>
                  <input placeholder="🔍 Buscar..." style={{ ...inputStyle, width: '100%', marginBottom: '15px' }} onChange={(e) => setBusquedaAdmin(e.target.value)} />
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
                          <td>
                            <button onClick={() => enviarRecordatorio(t)} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '5px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}>📲 Avisar</button>
                            <button onClick={() => eliminarTurno(t.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'pacientes' && (
                <section>
                  <h3>Gestión de Pacientes</h3>
                  <form onSubmit={guardarPaciente} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} />
                    <input placeholder="DNI" style={inputStyle} value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })} />
                    <button type="submit" style={btnLarge}>Guardar</button>
                  </form>
                  <table border="1" style={tableStyle}>
                    <tbody>{pacientes.map(p => <tr key={p.id}><td>{p.nombre}</td><td>{p.dni}</td></tr>)}</tbody>
                  </table>
                </section>
              )}

              {vista === 'medicos' && (
                <section>
                  <h3>Gestión Médicos</h3>
                  <form onSubmit={guardarMedico} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoMedico.nombre} onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} required />
                    <input placeholder="Especialidad" style={inputStyle} value={nuevoMedico.especialidad} onChange={(e) => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })} required />
                    <input placeholder="Matrícula" style={inputStyle} value={nuevoMedico.matricula} onChange={(e) => setNuevoMedico({ ...nuevoMedico, matricula: e.target.value })} required />
                    <button type="submit" style={btnLarge}>Añadir</button>
                  </form>
                </section>
              )}
            </>
          ) : (
            <section style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2>Hola, {pacienteEncontrado?.nombre}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Agendar Turno</h3>
                  <form onSubmit={guardarTurno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <select onChange={e => setNuevoTurno({ ...nuevoTurno, medico_id: e.target.value })} required style={inputStyle}>
                      <option value="">¿Con qué médico?</option>
                      {medicos.map(m => (<option key={m.id} value={m.id} style={{ color: 'black' }}>{m.nombre}</option>))}
                    </select>
                    <input type="date" onChange={e => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })} required style={inputStyle} />
                    <input type="time" onChange={e => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })} required style={inputStyle} />
                    <input placeholder="Motivo" onChange={e => setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })} required style={inputStyle} />
                    <button type="submit" style={btnLarge}>Confirmar</button>
                  </form>
                </div>
                <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
                  <h3>Mis Turnos</h3>
                  {turnos.filter(t => Number(t.paciente_id) === Number(pacienteEncontrado?.id)).map(t => (
                    <div key={t.id} style={{ borderLeft: '4px solid #4CAF50', padding: '10px', backgroundColor: '#333', marginBottom: '10px' }}>
                      <p><b>{t.fecha} - {t.hora}hs</b></p>
                      <p>Dr. {t.medico}</p>
                      <p style={{ fontSize: '12px', color: '#4CAF50' }}>Estado: {t.estado || 'Pendiente'}</p>
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
const cardStyle = { backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px', textAlign: 'center', flex: '1' };
const selectEstadoStyle = (estado) => ({ padding: '5px', borderRadius: '5px', backgroundColor: estado === 'Confirmado' ? '#2e7d32' : estado === 'Atendido' ? '#1565c0' : estado === 'Cancelado' ? '#c62828' : '#555', color: 'white', fontWeight: 'bold' });

export default App;