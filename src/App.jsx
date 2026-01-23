/* eslint-disable no-unused-vars */
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

  const [prefijo, setPrefijo] = useState('549')

  const hoy = new Date().toISOString().split('T')[0]

  const CODIGOS_PAIS = [
    { nombre: 'Argentina', codigo: '549', bandera: '🇦🇷' },
    { nombre: 'Chile', codigo: '56', bandera: '🇨🇱' },
    { nombre: 'España', codigo: '34', bandera: '🇪🇸' },
    { nombre: 'Uruguay', codigo: '598', bandera: '🇺🇾' },
    { nombre: 'México', codigo: '52', bandera: '🇲🇽' },
    { nombre: 'Otro', codigo: '', bandera: '🌐' }
  ]
  // Dicionario de traducciones
  const TEXTOS = {
    es: {
      titulo: " AITurnos",
      ingresar: "Ingresar",
      crear: "Crear Cuenta",
      agendar: "Agendar Turno",
      misTurnos: "Mis Turnos",
      confirmar: "Confirmar",
      placeholderDni: "DNI o Pasaporte",
      ayudaTel: "Selecciona tu país y escribe el número sin 0 ni 15.",
      volver: "Volver",
      nombre: "Nonbre Completo",
      whatsapp: "Número de WhatsApp",
      errorPaciente: "Error al registrar paciente. Revisa los datos.",
      errorDni: "Este DNI ya está registrado.",
      exitoRegistro: "¡Registro exitoso!",
      exitoUpdate: "Datos actualizados correctamente",
      errorValidacion: "* Completa nombre, apellido y DNI (min. 6 carac.)"
    },
    en: {
      titulo: "AI-Booking",
      ingresar: "Login",
      crear: "Create Account",
      agendar: "Book Appointment",
      misTurnos: "My Appointments",
      confirmar: "Confirm",
      placeholderDni: "ID or Passport",
      ayudaTel: "Select your country and type the number without local prefixes.",
      volver: "Go Back",
      nombre: "Full Name",
      whatsapp: "WhatsApp Number",
      errorPaciente: "Error registering patient. Please check the data.",
      errorDni: "This ID is already registered.",
      exitoRegistro: "Registration successful!",
      exitoUpdate: "Data updated successfully",
      errorValidacion: "* Please fill in full name and ID (min. 6 char.)"
    }
  }

  // Esado para el idioma
  const [idioma, setIdioma] = useState('es')

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

    // Verificamos duplicados de DNI 
    if (!nuevoPaciente.id && pacientes.some(p => p.dni === nuevoPaciente.dni)) {
      alert(TEXTOS[idioma].errorDni)
      return
    }

    // Procesamos los datos
    const numeroLimpio = nuevoPaciente.telefono.replace(/\D/g, '')
    const telefonoFinal = prefijo + numeroLimpio 
    const nombreFormateado = nuevoPaciente.nombre.replace(/\b\w/g, l => l.toUpperCase())

    // Preparamos el objeto 
    const datosLimpios = { 
      nombre: nombreFormateado, 
      dni: nuevoPaciente.dni,
      telefono: telefonoFinal 
    };

    const urlBase = 'https://sisteme-turnos-backend-production.up.railway.app/pacientes';
    
    try {
      if (nuevoPaciente.id) { 
        await axios.put(`${urlBase}/${nuevoPaciente.id}`, datosLimpios);
        alert(TEXTOS[idioma].exitoUpdate); 
      } else { 
        await axios.post(urlBase, datosLimpios); 
        alert(TEXTOS[idioma].exitoRegistro);
      }

      // Limpieza de estados
      setNuevoPaciente({ id: null, nombre: '', dni: '', telefono: '' });
      setMostrarRegistro(false);
      obtenerDatos();
    } catch (err) { alert(TEXTOS[idioma].errorPaciente) }
  };

  const eliminarPaciente = async (id) => {
    if (window.confirm("¿Eliminar este paciente?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/pacientes/${id}`);
        obtenerDatos();
      } catch (err) { alert("Error al eliminar") }
    }
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
    } catch (err) { alert("Error en médico") }
  };

  const eliminarMedico = async (id) => {
    if (window.confirm("¿Eliminar este médico?")) {
      try {
        await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/medicos/${id}`);
        obtenerDatos();
      } catch (err) { alert("Error al eliminar") }
    }
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
    } catch (err) { alert("Error al agendar") }
  };

  const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, { estado: nuevoEstado });
      obtenerDatos();
    } catch (err) { alert("Error al cambiar estado") }
  };

  const eliminarTurno = async (id) => {
    if (window.confirm("¿Eliminar turno?")) {
      try { await axios.delete(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`); obtenerDatos(); }
      catch (err) { alert("Error al borrar") }
    }
  };

  const enviarRecordatorio = (turno) => {
    // Calculamos la fecha de mañana para comparar
    const fechaManana = new Date()
    fechaManana.setDate(fechaManana.getDate() + 1)
    const mananaStr = fechaManana.toISOString().split('T')[0]

    let momento = "próximamente";
    if (turno.fecha === hoy) {
      momento = "HOY";
    }else if (turno.fecha === mananaStr) {
      momento = "MAÑANA";
    }

    const mensaje = `Hola ${turno.paciente}, te recordamos que tienes un turno agendado para ${momento}, el día ${turno.fecha} a las ${turno.hora}hs con el Dr. ${turno.medico}. ¡Te esperamos!`;

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

  const esValido = () => {
    const dniValido = nuevoPaciente.dni.length >= 6 // Mínimo 6 caracteres para DNI/Pasaporte
    const nombreValido = nuevoPaciente.nombre.trim().includes(' ') // Al menos nombre y apellido
    const telefonoValido = nuevoPaciente.telefono.replace(/\D/g, '').length >= 7 //Al menos 7 números

    return dniValido && nombreValido && telefonoValido
  }

  // ==========================================
  // 4. RENDERIZADO
  // ==========================================
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>

      {/* Selector de idioma - Solo visible si no se ha logueado nadie */}
      {!rol && (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button onClick={() => setIdioma('es')} style={{ background: idioma === 'es' ? '#444' : 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px', borderRadius: '5px', marginRight: '10px '}}>🇪🇸 ES</button>
          <button onClick={() => setIdioma('en')} style={{ background: idioma === 'en' ? '#444' : 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}>🇺🇸 EN</button>
        </div>
      )}
      {!rol ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>{TEXTOS[idioma].titulo}</h1>
          <div style={{ backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '20px', maxWidth: '350px', margin: '0 auto' }}>
            
            {!mostrarRegistro ? (

              // Vista de login
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3>{TEXTOS[idioma].ingresar}</h3>
                <input 
                  placeholder={TEXTOS[idioma].placeholderDni} 
                  style={inputStyle} 
                  value={busquedaDni} 
                  onChange={(e) => setBusquedaDni(e.target.value)} 
                />
                <button onClick={buscarPaciente} style={btnLarge}>{TEXTOS[idioma].ingresar}</button>
                <button onClick={() => setRol('admin_login')} style={{ background: 'none', color: '#4CAF50', border: 'none', cursor: 'pointer' }}>Acceso Admin</button>
              </div>
            ) : (

              //Vista de registro
              <form onSubmit={guardarPaciente} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3>{TEXTOS[idioma].crear}</h3>
                <input 
                  placeholder={TEXTOS[idioma].nombre}
                  style={inputStyle} 
                  value={nuevoPaciente.nombre} 
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} 
                  required 
                />
                <input value={busquedaDni} readOnly style={{ ...inputStyle, backgroundColor: '#444' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>   
                    {/* SELECTOR DE BANDERAS */}
                    <select 
                      value={prefijo} 
                      onChange={(e) => setPrefijo(e.target.value)}
                      style={{ ...inputStyle, width: '90px', padding: '5px', fontSize: '14px' }}
                    >
                      {CODIGOS_PAIS.map(p => (
                        <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>
                      ))}
                    </select>
    
                    {/* CAMPO DE NÚMERO */}
                    <input 
                      placeholder={TEXTOS[idioma].whatsapp}
                      style={{ ...inputStyle, flex: 1 }} 
                      value={nuevoPaciente.telefono} 
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })} 
                      required 
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: '#aaa' }}>
                    {TEXTOS[idioma].ayudaTel}
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={!esValido()} 
                  style={{btnLarge, backgroundColor: esValido() ? '#4CAF50' : '#555', cursor: esValido() ? 'pointer' : 'not-allowed', opacity: esValido() ? 1 : 0.6 }}
                >
                  {TEXTOS[idioma].confirmar}
                </button>

                {!esValido() && (
                  <span style={{fontSize: '10px', color: '#ff4444', textAlign: 'center' }}>
                    {idioma === 'es'
                      ? '* Completa nombre, apellido y DNI (min. 6 carac.)'
                      : '* Fill in full name and ID (min. 6 char.)'}
                  </span>
                )}

                <button type="button" onClick={() => setMostrarRegistro(false)} style={{ background: 'none', color: 'gray', border: 'none', cursor: 'pointer' }}>
                  {TEXTOS[idioma].volver}
                </button>
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
              {/* --- ESTADÍSTICAS RÁPIDAS (Admin) --- */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* Turnos totales del día */}
                <div style={{ ...cardStyle, borderTop: '5px solid #4CAF50' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>TURNOS HOY</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                    {turnos.filter(t => t.fecha === hoy).length}
                  </p>
                </div>

                {/* Pacientes que ya pasaron por el consultorio hoy */}
                <div style={{ ...cardStyle, borderTop: '5px solid #2196F3' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>ATENDIDOS HOY</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0', color: '#2196F3' }}>
                    {turnos.filter(t => t.fecha === hoy && t.estado === 'Atendido').length}
                  </p>
                </div>

                {/* Lo que queda pendiente en la sala de espera */}
                <div style={{ ...cardStyle, borderTop: '5px solid #FFC107' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>POR ATENDER</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0', color: '#FFC107' }}>
                    {turnos.filter(t => t.fecha === hoy && (t.estado === 'Pendiente' || t.estado === 'Confirmado')).length}
                  </p>
                </div>
              </div>

              {vista === 'turnos' && (
                <section>
                  <input 
                    placeholder="Buscar paciente o médico..." 
                    style={{ ...inputStyle, width: '100%', marginBottom: '15px' }} 
                    onChange={(e) => setBusquedaAdmin(e.target.value)} 
                  />

                  <table border="1" style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Médico</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnos
                        .filter(t =>
                          t.paciente?.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
                          t.medico?.toLowerCase().includes(busquedaAdmin.toLowerCase)
                        )
                        .map(t => {
                          const esHoy = t.fecha === hoy

                        return (
                          <tr 
                            key={t.id} 
                            style={{ 
                              backgroundColor: esHoy ? '#3d3d3d' : 'transparent', // Un gris más claro si es hoy
                              borderLeft: esHoy ? '4px solid #4CAF50' : 'none'    // Una sutil línea verde lateral
                            }}
                          >
                            <td style={{ padding: '10px' }}>{t.paciente}</td>
                            <td>{t.medico}</td>
                            <td>
                              <span style={{ fontWeight: esHoy ? 'bold' : 'normal' }}>
                                {t.fecha}
                              </span>
                            </td>
                            <td>
                              <select 
                                value={t.estado} 
                                onChange={(e) => actualizarEstadoTurno(t.id, e.target.value)} 
                                style={selectEstadoStyle(t.estado)}
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Atendido">Atendido</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td>
                              <button 
                                onClick={() => enviarRecordatorio(t)} 
                                style={{ backgroundColor: '#25D366', color: 'white', border: 'none', padding: '5px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}
                              >
                                📲 Avisar
                              </button>
                              <button 
                                onClick={() => eliminarTurno(t.id)} 
                                style={{ color: '#F44336', border: 'none', background: 'none', cursor: 'pointer' }}
                              >
                                Borrar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'pacientes' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Gestión de Pacientes</h3>
                    <input placeholder="🔍 Buscar..." style={{ ...inputStyle, width: '250px' }} onChange={(e) => setBusquedaAdmin(e.target.value)} />
                  </div>
                  <form onSubmit={guardarPaciente} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoPaciente.nombre} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} required />
                    <input placeholder="DNI" style={inputStyle} value={nuevoPaciente.dni} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })} required />
                    <input placeholder="WhatsApp" style={inputStyle} value={nuevoPaciente.telefono} onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })} required />
                    <button type="submit" style={btnLarge}>{nuevoPaciente.id ? '💾 Actualizar' : '➕ Añadir'}</button>
                    {nuevoPaciente.id && <button type="button" onClick={() => setNuevoPaciente({ id: null, nombre: '', dni: '', telefono: '' })} style={{ marginLeft: '10px' }}>Cancelar</button>}
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Nombre</th><th>DNI</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {pacientes.filter(p => p.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) || p.dni.includes(busquedaAdmin)).map(p => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td><td>{p.dni}</td>
                          <td>
                            <button onClick={() => setNuevoPaciente(p)} style={{ color: 'orange', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Editar</button>
                            <button onClick={() => eliminarPaciente(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              {vista === 'medicos' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Gestión Médicos</h3>
                    <input placeholder="🔍 Buscar..." style={{ ...inputStyle, width: '250px' }} onChange={(e) => setBusquedaAdmin(e.target.value)} />
                  </div>
                  <form onSubmit={guardarMedico} style={formStyle}>
                    <input placeholder="Nombre" style={inputStyle} value={nuevoMedico.nombre} onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} required />
                    <input placeholder="Especialidad" style={inputStyle} value={nuevoMedico.especialidad} onChange={(e) => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })} required />
                    <input placeholder="Matrícula" style={inputStyle} value={nuevoMedico.matricula} onChange={(e) => setNuevoMedico({ ...nuevoMedico, matricula: e.target.value })} required />
                    <input placeholder="Teléfono" style={inputStyle} value={nuevoMedico.telefono} onChange={(e) => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} required />
                    <button type="submit" style={btnLarge}>{nuevoMedico.id ? '💾 Actualizar' : '➕ Añadir'}</button>
                    {nuevoMedico.id && <button type="button" onClick={() => setNuevoMedico({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '' })} style={{ marginLeft: '10px' }}>Cancelar</button>}
                  </form>
                  <table border="1" style={tableStyle}>
                    <thead><tr><th>Médico</th><th>Matrícula</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {medicos.filter(m => m.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase())).map(m => (
                        <tr key={m.id}>
                          <td>{m.nombre}</td><td>{m.matricula}</td>
                          <td>
                            <button onClick={() => { setNuevoMedico(m); window.scrollTo(0,0); }} style={{ color: 'orange', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>✏️ Editar</button>
                            <button onClick={() => eliminarMedico(m.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      {medicos.map(m => (<option key={m.id} value={m.id} style={{ color: 'black' }}>{m.nombre} - {m.especialidad}</option>))}
                    </select>
                    <input type="date" min={hoy} onChange={e => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })} required style={inputStyle} />
                    <input type="time" min="08:00" max="20:00" onChange={e => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })} required style={inputStyle} />
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
                      <p style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>Estado: {t.estado || 'Pendiente'}</p>
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
const selectEstadoStyle = (estado) => ({ 
  padding: '6px 10px',
  borderRadius: '20px', 
  border: 'none',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: 'white',
  backgroundColor: 
    estado === 'Confirmado' ? '#2e7d32' :
    estado === 'Atendido' ? '#1565c0' : 
    estado === 'Cancelado' ? '#c62828' : 
    '#666'
  });

export default App;