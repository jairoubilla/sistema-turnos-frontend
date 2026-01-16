import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  // --Estados --
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [turnos, setTurnos] = useState([])
  const [vista, setVista] = useState('pacientes') // Controla que tabla vemos
  // Formulario Pacientes
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', dni: '', telefono: '' })
  // Formulario Medicos
  const [nuevoMedico, setNuevoMedico] = useState({nombre: '', especialidad: '', telefono: '', matricula: ''})
  // Formulario Turnos
  const [nuevoTurno, setNuevoTurno] = useState({ paciente_id: '', medico_id: '',fecha: '', hora: '', motivo: '' })
  
  // --- Funciones para traer datos del servidor ---
  const obtenerDatos = async () => {
    try {
      const resP = await axios.get('https://sisteme-turnos-backend-production.up.railway.app/pacientes')
      setPacientes(resP.data)
      const resM = await axios.get('https://sisteme-turnos-backend-production.up.railway.app/medicos')
      setMedicos(resM.data)
      const resT = await axios.get('https://sisteme-turnos-backend-production.up.railway.app/turnos')
      setTurnos(resT.data)
    }catch (err) { console.error("Error al cargar datos: ", err) }
  }

  const obtenerPacientes = async () => {
    try {
      const res = await axios.get('https://sisteme-turnos-backend-production.up.railway.app/pacientes')
      setPacientes(res.data)
    } catch (err) {
      console.error("Error al obtener paciente:", err)
    }
  }


  const obtenerMedicos = async () => {
    try {
      const res = await axios.get('https://sisteme-turnos-backend-production.up.railway.app/medicos')
      setMedicos(res.data)
    } catch (err) {
      console.error("Error al obtener medico:", err)
    }
  }
  // ---Carga de Datos--
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    obtenerPacientes() 
    obtenerMedicos()
    obtenerDatos()
  }, [])

 // --- MANEJADORES DE CAMBIO ---
  const manejarCambio = (e) => {
    setNuevoPaciente({ ...nuevoPaciente, [e.target.name]: e.target.value })
  }

  const manejarCambioMedico = (e) => {
    setNuevoMedico({ ...nuevoMedico, [e.target.name]: e.target.value })
  }
  
  const guardarPaciente = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/pacientes', nuevoPaciente)
      alert("Paciente guardado")
      setNuevoPaciente({ nombre: '', dni: '', telefono: '' })
      obtenerPacientes()
    } catch (err) {
      const mensajeError = err.response? JSON.stringify(err.response.data) : err.message;
      alert("Error al guardar: " + mensajeError);
    }
  }
  
  const guardarMedico = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/medicos', nuevoMedico)
      alert("Medico guardado")
      setNuevoMedico({ nombre: '', dni: '', telefono: '', matricula: '' })
      obtenerMedicos()
    } catch (err) {
      const mensajeError = err.response? JSON.stringify(err.response.data) : err.message;
      alert("Error al guardar: " + mensajeError)
      console.error("Detalle tecnico: ", err);
    }
  }

  const guardarTurno = async (e) => {
    e.preventDefault()
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', nuevoTurno)
      alert("Turno agendado correctamente")
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '' })
      obtenerDatos()
    // eslint-disable-next-line no-unused-vars
    } catch (err) { alert("Error al agendar turno") }
  }

  // Agregamos la función para eliminar
  const eliminarPaciente = async (id) => {
    if(window.confirm("¿Deseas eliminar este paciente?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/pacientes/${id}`)
        obtenerPacientes()
      } catch (err) {
        console.error("Error al eliminar:", err)
      }
    }
  }

  const eliminarMedico = async (id) => {
    if(window.confirm("¿Deseas eliminar este medico?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/medicos/${id}`)
        obtenerMedicos()
      } catch (err) {
        console.error("Error al eliminar:", err)
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  const eliminarTurno = async (id) => {
    if (window.confirm("¿Estás segro de que quieres eliminar este turno?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`);
        obtenerDatos();
      // eslint-disable-next-line no-unused-vars
      }catch (err) {
        alert("Error al eliminar el turno")
      }
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🏥 Sistema de Gestion Hospitalaria</h1>

      {/* Navegación*/}
      <div style={{ marginBottom: '20px'}}>
        <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>Pacientes</button>
        <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>Médicos</button>
        <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>Turnos</button>
      </div>

      <hr />
      
    {/* Seccion Turnos*/}
  {vista === 'turnos' && (
    <section>
      <h2>Agendar Nuevo Turno</h2>
      <form onSubmit={guardarTurno} style={formStyle}>
        {/* 1. Selector de pacientes */}
        <select value={nuevoTurno.paciente_id} onChange={e => setNuevoTurno({...nuevoTurno, paciente_id: e.target.value})} required>
          <option value="">Seleccionar Paciente</option>
          {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} (DNI: {p.dni})</option>)}
        </select>
  {/* 2. Selector de Médicos */}
  <select value={nuevoTurno.medico_id} onChange={e => setNuevoTurno({...nuevoTurno, medico_id: e.target.value})} required>
    <option value="">Seleccionar Médico</option>
    {medicos.map(m => (<option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>))}
  </select>
        <input type="date" value={nuevoTurno.fecha} onChange={e => setNuevoTurno({...nuevoTurno, fecha: e.target.value})} required />
        <input type="time" value={nuevoTurno.hora} onChange={e => setNuevoTurno({...nuevoTurno, hora: e.target.value})} required />
        <input placeholder="Motivo" value={nuevoTurno.motivo} onChange={e => setNuevoTurno({...nuevoTurno, motivo: e.target.value})} required />
        
        <button type="submit" style={{backgroundColor: '#4CAF50', color: 'white'}}>Agendar</button>
      </form>

      <table border="1" style={tableStyle}>
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Motivo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map(t => (
            <tr key={t.id}>
              <td>{t.paciente}</td><td>{t.medico}</td><td>{t.fecha}</td><td>{t.hora}</td><td>{t.motivo}</td>
                <td>
                  <button onClick={() => eliminarTurno(t.id)}
                style={{backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px'}}>
                  Eliminar
                </button>
              </td>
              <td>
                <a
                href={`https://wa.me/${t.telefono_paciente}?text=Hola%20${t.paciente},%20te%20recordamos%20tu%20turno%20el%20día%20${t.fecha}%20a%20las%20${t.hora}`}
                target='_blank'
                rel='noreferrer'
                style={{backgroundColor: '#25D366', color: 'white', padding: '5px 10px', borderRadius: '5px', textDecoration: 'none'}}
                >
                  Recordar por WA
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )}

      {/* Seccion pacientes */}
      {vista === 'pacientes' && (
        <section>
          <h2>Registrar Paciente</h2>
          <form onSubmit={guardarPaciente} style={formStyle}>
            <input name="nombre" placeholder="Nombre" value={nuevoPaciente.nombre} onChange={manejarCambio} required />
            <input name="dni" placeholder="DNI" value={nuevoPaciente.dni} onChange={manejarCambio} required  />
            <input name="telefono" placeholder="Telefono" value={nuevoPaciente.telefono} onChange={manejarCambio} required  />
            <button type="submit">Guardar</button>
          </form>

          <table border="1" style={tableStyle}>
            <thead>
              <tr><th>Nombre</th><th>DNI</th><th>Telefono</th></tr>
            </thead>
            <tbody>
              {pacientes.map(p => ( <tr key={p.id}>
                  <td>{p.nombre}</td><td>{p.dni}</td><td>{p.telefono}</td>
                  <td><button onClick={() => eliminarPaciente(p.id)} style={{ color: 'red', cursor: 'pointer' }}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
  )}

  {/* Sección Médicos */}
  {vista === 'medicos' && (
    <section>
      <h2>Registrar Médico</h2>
      <form onSubmit={guardarMedico} style={formStyle}>
        <input name="nombre" placeholder="Nombre" value={nuevoMedico.nombre} onChange={manejarCambioMedico} required />
        <input name="especialidad" placeholder="Especialidad" value={nuevoMedico.especialidad} onChange={manejarCambioMedico} required />
        <input name="matricula" placeholder="Matrícula" value={nuevoMedico.matricula} onChange={manejarCambioMedico} required />
        <input name="telefono" placeholder="Teléfono" value={nuevoMedico.telefono} onChange={manejarCambioMedico} required />
        <button type="submit">Guardar</button>
      </form>

      <table border="1" style={tableStyle}>
        <thead>
          <tr><th>Nombre</th><th>Especialidad</th><th>Matricula</th><th>Telefono</th></tr>
        </thead>
        <tbody>
          {medicos.map(m => (
            <tr key={m.id}>
              <td>{m.nombre}</td>
              <td>{m.especialidad}</td>
              <td>{m.matricula}</td>
              <td>{m.telefono}</td>
              <td><button onClick={() => eliminarMedico(m.id)} style={{ color: 'red', cursor: 'pointer' }}>Eliminar</button></td>
              </tr>
          ))}
        </tbody>
      </table>
    </section>
  )}

  


    </div>
  )
}

// --- Estilos ---
const btnTab = (active) => ({
  padding: '10px 20px',
  cursor: 'pointer',
  backgroundColor: active ? '#4CAF50' : '#333',
  color: 'white',
  border: 'none',
  marginRight: '5px',
  borderRadius: '5px'
})

const formStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }
const tableStyle = {width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#333'}

export default App