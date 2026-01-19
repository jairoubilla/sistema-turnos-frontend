import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // -- Estados --
  const [rol, setRol] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [turnos, setTurnos] = useState([])
  const [vista, setVista] = useState('pacientes')

  // Formularios
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', dni: '', telefono: '' })
  const [nuevoMedico, setNuevoMedico] = useState({ nombre: '', especialidad: '', telefono: '', matricula: '' })
  const [nuevoTurno, setNuevoTurno] = useState({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '' })

  // --- Funciones para traer datos ---
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

  useEffect(() => { obtenerDatos() }, [])

  // --- Manejadores y Guardado ---
  const manejarCambio = (e) => setNuevoPaciente({ ...nuevoPaciente, [e.target.name]: e.target.value })
  const manejarCambioMedico = (e) => setNuevoMedico({ ...nuevoMedico, [e.target.name]: e.target.value })

  const guardarPaciente = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/pacientes', nuevoPaciente)
      alert("Paciente guardado"); setNuevoPaciente({ nombre: '', dni: '', telefono: '' }); obtenerDatos();
    } catch (err) { alert("Error al guardar paciente") }
  }

  const guardarMedico = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/medicos', nuevoMedico)
      alert("Medico guardado"); setNuevoMedico({ nombre: '', especialidad: '', telefono: '', matricula: '' }); obtenerDatos();
    } catch (err) { alert("Error al guardar medico") }
  }

  const guardarTurno = async (e) => {
    e.preventDefault()
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', nuevoTurno)
      alert("Turno agendado"); setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '' }); obtenerDatos();
    } catch (err) { alert("Error al agendar turno") }
  }

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar este turno?")) {
      try { await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`); obtenerDatos(); }
      catch (err) { alert("Error al eliminar") }
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>

      {!rol ? (
        /* --- 1. PANTALLA INICIAL DE SELECCIÓN --- */
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>🏥 AITurnos</h1>
          <p>Bienvenido, seleccione su rol para continuar:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
            <button onClick={() => setRol('paciente')} style={btnLarge}>Soy Paciente (Sacar Turno)</button>
            <button onClick={() => setRol('admin')} style={btnLargeSecondary}>Soy Administrador</button>
          </div>
        </div>
      ) : (
        /* --- 2. CONTENIDO SEGÚN ROL --- */
        <div>
          <button onClick={() => setRol(null)} style={{ marginBottom: '20px', cursor: 'pointer', padding: '10px', borderRadius: '5px' }}>⬅️ Volver al Inicio</button>

          {rol === 'admin' ? (
            /* --- VISTA ADMINISTRADOR --- */
            <>
              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>Pacientes</button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>Médicos</button>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>Turnos</button>
              </div>
              <hr />

              {vista === 'turnos' && (
                <section>
                  <h2>Panel de Turnos</h2>
                  <form onSubmit={guardarTurno} style={formStyle}>
                    <select value={nuevoTurno.paciente_id} onChange={e => setNuevoTurno({ ...nuevoTurno, paciente_id: e.target.value })} required>
                      <option value="">Seleccionar Paciente</option>
                      {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} (DNI: {p.dni})</option>)}
                    </select>
                    <select value={nuevoTurno.medico_id} onChange={e => setNuevoTurno({ ...nuevoTurno, medico_id: e.target.value })} required>
                      <option value="">Seleccionar Médico</option>
                      {medicos.map(m => (<option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>))}
                    </select>
                    <input type="date" value={nuevoTurno.fecha} onChange={e => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })} required />
                    <input type="time" value={nuevoTurno.hora} onChange={e => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })} required />
                    <input placeholder="Motivo" value={nuevoTurno.motivo} onChange={e => setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })} required />
                    <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', cursor: 'pointer' }}>Agendar</button>
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead>
                      <tr><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Hora</th><th>Acción</th><th>Notificar</th></tr>
                    </thead>
                    <tbody>
                      {turnos.map(t => (
                        <tr key={t.id}>
                          <td>{t.paciente}</td><td>{t.medico}</td><td>{t.fecha}</td><td>{t.hora}</td>
                          <td><button onClick={() => eliminarTurno(t.id)} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button></td>
                          <td>
                            <a href={`https://wa.me/${t.telefono_paciente}?text=Hola%20${t.paciente},%20recordamos%20tu%20turno%20el%20${t.fecha}`} target='_blank' rel='noreferrer' style={{ backgroundColor: '#25D366', color: 'white', padding: '5px', borderRadius: '5px', textDecoration: 'none', fontSize: '12px' }}>WhatsApp</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'pacientes' && (
                <section>
                  <h2>Gestionar Pacientes</h2>
                  <form onSubmit={guardarPaciente} style={formStyle}>
                    <input name="nombre" placeholder="Nombre" value={nuevoPaciente.nombre} onChange={manejarCambio} required />
                    <input name="dni" placeholder="DNI" value={nuevoPaciente.dni} onChange={manejarCambio} required />
                    <input name="telefono" placeholder="Telefono" value={nuevoPaciente.telefono} onChange={manejarCambio} required />
                    <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', cursor: 'pointer' }}>Guardar</button>
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>DNI</th><th>Telefono</th></tr></thead>
                    <tbody>
                      {pacientes.map(p => (<tr key={p.id}><td>{p.nombre}</td><td>{p.dni}</td><td>{p.telefono}</td></tr>))}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'medicos' && (
                <section>
                  <h2>Gestionar Médicos</h2>
                  <form onSubmit={guardarMedico} style={formStyle}>
                    <input name="nombre" placeholder="Nombre" value={nuevoMedico.nombre} onChange={manejarCambioMedico} required />
                    <input name="especialidad" placeholder="Especialidad" value={nuevoMedico.especialidad} onChange={manejarCambioMedico} required />
                    <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', cursor: 'pointer' }}>Guardar</button>
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>Especialidad</th></tr></thead>
                    <tbody>
                      {medicos.map(m => (<tr key={m.id}><td>{m.nombre}</td><td>{m.especialidad}</td></tr>))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          ) : (
            /* --- VISTA PACIENTE --- */
            <section style={{ textAlign: 'center', backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '15px' }}>
              <h2>Reserva de Turnos</h2>
              <p>Hola, aquí podrás agendar tu cita médica en segundos.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
                  {/* Este formulario lo haremos inteligente en el siguiente paso */}
                  <input placeholder="Ingresa tu DNI" style={{ padding: '10px' }} />
                  <button style={btnLarge}>Buscar mis datos</button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

// --- Estilos ---
const btnLarge = { padding: '20px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' };
const btnLargeSecondary = { ...btnLarge, backgroundColor: '#333', fontSize: '14px' };
const btnTab = (active) => ({ padding: '10px 20px', cursor: 'pointer', backgroundColor: active ? '#4CAF50' : '#333', color: 'white', border: 'none', marginRight: '5px', borderRadius: '5px' })
const formStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#333' }

export default App