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

  const [nuevoPaciente, setNuevoPaciente] = useState({ id: null, nombre: '', dni: '', telefono: '', alergias: '' });
  const [nuevoMedico, setNuevoMedico] = useState({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '', consultorio: '' });
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
      errorValidacion: "* Completa nombre, apellido y DNI (min. 6 carac.)",
      historiaClinica: "Historia Clínica",
      evolucion: "Evolución Médica",
      siRegistros: "No hay antecedentes registrados",
      nuevaEntrada: "Agregar Evolución"
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
      errorValidacion: "* Please fill in full name and ID (min. 6 char.)",
      historiaClinica: "Medical History",
      evolucion: "Medical Evolution",
      siRegistros: "No medical records found for this patient.",
      verHistorial: "View History",
      detalleHistorial: "Consultation History"
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
    const datosParaEnviar = { 
      nombre: nuevoMedico.nombre, 
      especialidad: nuevoMedico.especialidad, 
      matricula: nuevoMedico.matricula, 
      telefono: nuevoMedico.telefono,
      consultorio: nuevoMedico.consultorio
    };
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

    //Buscamos si ya existe un turno con ese médico, fecha y hora
    const turnoOcupado = turnos.find(t =>
      t.medico_id === Number(nuevoTurno.medico_id) &&
      t.fecha === nuevoTurno.fecha &&
      t.hora === nuevoTurno.hora &&
      t.estado !== 'Cancelado' // Si esta cancelado, el horario queda libre
    )

    if (turnoOcupado) {
      alert(idioma === 'es'
        ? "Este horario ya esta ocupado para este médico. Por favor elige otro."
        : "This slot is already taken for this doctor. Please choose another one.")
      return // Cortamos la funcion aqui, no se envia nada al backend
    }

    //Si el horario está libre, procedemos a guardar
    const datosFinales = { 
      ...nuevoTurno, 
      paciente_id: Number(pacienteEncontrado?.id) 
    };
    try {
      await axios.post('https://sisteme-turnos-backend-production.up.railway.app/turnos', datosFinales);
      alert(idioma === 'es' ? "¡Turno agendado!" : "Appointment scheduled");
      setNuevoTurno({ paciente_id: '', medico_id: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
      obtenerDatos();
    } catch (err) { alert("Error al agendar") }
  };

  const actualizarEstadoTurno = async (id, nuevoEstado, nuevaNota = null) => {
    try {
      const datosAEnviar = { estado: nuevoEstado}
      // Si mandamos una nota, la incluimos en el objeto "motivo"
      if (nuevaNota !== null) datosAEnviar.motivo = nuevaNota

      await axios.put(`https://sisteme-turnos-backend-production.up.railway.app/turnos/${id}`, datosAEnviar);
      obtenerDatos();
    } catch (err) {
      alert("Error al cambiar estado") 
    }
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

  const exportarExcel = () => {
    // Definimos los titulos de las columnas
    const encabezados = "PACIENTE\tDNI/PASAPORTE\tTELÉFONO\tMÉDICO\tFECHA\tHORA\tESTADO\tNOTAS/MOTIVO\n";

    // Filtramos solo los turnos que se ven en pantalla (o todos los de hoy)
    const datosParaExportar = turnosFiltrados.length > 0 ? turnosFiltrados : turnos.filter(t => t.fecha === hoy)

    // Construimos las filas uniendo los datos con tabulaciones (\t)
    const filas = datosParaExportar.map(t => {
      // Buscamos el dni y el telefono extra si no vienen en el objeto turno
      const p = pacientes.find(pac => pac.nombre === t.paciente) || {}
      return `${t.paciente}\t${p.dni || 'N/A'}\t${p.telefono || 'N/A'}\t${t.medico}\t${t.fecha}\t${t.hora}\t${t.estado}\t${t.motivo || ''}`
    }).join("\n");

    // Creamos el archivo y lo descargamos
    const blob = new Blob(["\ufeff" + encabezados + filas], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planilla_Turnos_${hoy}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verHistoriaClinica = (pacienteNombre) => {
    const historial = turnos
      .filter(t => t.paciente === pacienteNombre && t.motivo)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (historial.length === 0) {
      alert(TEXTOS[idioma].sinRegistros);
      return;
    }

    const titulo = `🏥 ${TEXTOS[idioma].historiaClinica}: ${pacienteNombre}`;
  
    const detalle = historial.map(h => 
      `📅 ${h.fecha} | Dr. ${h.medico}:\n📝 ${h.motivo}\n-------------------`
    ).join("\n\n");

    alert(`${titulo}\n\n${detalle}`);
  };

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

                <input 
                  placeholder={idioma === 'es' ? "Alergias (Ej: Penicilina, ninguna)" : "Allergies (Ex: Penicillin, none)"} 
                  style={{ ...inputStyle, border: nuevoPaciente.alergias ? '1px solid #ff4444' : 'none' }} 
                  value={nuevoPaciente.alergias} 
                  onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, alergias: e.target.value })} 
                />

                <button 
                  type="submit" 
                  disabled={!esValido()} 
                  style={{ ...btnLarge, backgroundColor: esValido() ? '#4CAF50' : '#555', cursor: esValido() ? 'pointer' : 'not-allowed', opacity: esValido() ? 1 : 0.6 }}
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
            <h3> Clave Admin</h3>
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
              {/* --- BARRA DE NAVEGACIÓN ADMIN (DENTRO DEL PANEL) --- */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setVista('turnos')} style={btnTab(vista === 'turnos')}>
                  {idioma === 'es' ? 'Turnos' : 'Appointments'}
                </button>
                <button onClick={() => setVista('pacientes')} style={btnTab(vista === 'pacientes')}>
                  {idioma === 'es' ? 'Pacientes' : 'Patients'}
                </button>
                <button onClick={() => setVista('medicos')} style={btnTab(vista === 'medicos')}>
                  {idioma === 'es' ? 'Médicos' : 'Doctors'}
                </button>
                <button 
                  onClick={() => setVista('tv')} 
                  style={btnTab(vista === 'tv')}
                >
                  📺 {idioma === 'es' ? 'Modo TV' : 'TV Mode'}
                </button>
              </div>

              {/* --- ESTADÍSTICAS RÁPIDAS Y HERRAMIENTAS (Admin) --- */}
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

              {/* BOTÓN DE EXPORTACIÓN */}
              <button
                onClick={exportarExcel}
                style={{
                  ...btnLarge,
                  backgroundColor: '#2E7D32',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {idioma === 'es' ? 'Descargar Planilla Excel del Día' : 'Download Today\'s Excel Sheet'}
              </button>

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
                            <td
                              style={{
                                cursor: 'pointer',
                                color: '#4CAF50',
                                fontWeight: 'bold',
                                textDecoration: 'underline dotted'
                              }}
                              title={idioma === 'es' ? "Click para editar nota médica" : "Click to edit medical note"}
                              onClick={() => {
                                const nuevaNota = prompt(
                                  idioma === 'es' ? "Evolucion / Nota médica para este turno:" : "Medical note for this appointment:",
                                  t.motivo
                                )

                                // Si el usuario no cancela el prompt, guardamos la nota
                                if (nuevaNota !== null) {
                                  actualizarEstadoTurno(t.id, t.estado, nuevaNota)
                                }
                              }}
                            >
                              {t.medico}
                            </td>
                            <td>
                              <span style={{ fontWeight: esHoy ? 'bold' : 'normal'}}>
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
                    <h3>{idioma === 'es' ? 'Gestión de Pacientes' : 'Patient Management'}</h3>
                    <input 
                      placeholder="🔍 Buscar..." 
                      style={{ ...inputStyle, width: '250px' }} 
                      onChange={(e) => setBusquedaAdmin(e.target.value)} 
                    />
                  </div>

                  {/* FORMULARIO MEJORADO CON ALERGIAS */}
                  <form onSubmit={guardarPaciente} style={formStyle}>
                    <input 
                      placeholder={TEXTOS[idioma].nombre} 
                      style={inputStyle} 
                      value={nuevoPaciente.nombre} 
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })} 
                      required 
                    />
                    <input 
                      placeholder={TEXTOS[idioma].placeholderDni} 
                      style={inputStyle} 
                      value={nuevoPaciente.dni} 
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, dni: e.target.value })} 
                      required 
                    />
      
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <select 
                        value={prefijo} 
                        onChange={(e) => setPrefijo(e.target.value)}
                        style={{ ...inputStyle, width: '80px', padding: '5px' }}
                      >
                        {CODIGOS_PAIS.map(p => (
                          <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>
                        ))}
                      </select>
                      <input 
                        placeholder="WhatsApp" 
                        style={{ ...inputStyle, flex: 1 }} 
                        value={nuevoPaciente.telefono} 
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })} 
                        required 
                      />
                    </div>

                    {/* CAMPO DE ALERGIAS (Punto clave) */}
                    <input 
                      placeholder={idioma === 'es' ? "Alergias / Advertencias" : "Allergies / Warnings"} 
                      style={{ 
                        ...inputStyle, 
                        width: '100%', 
                        border: nuevoPaciente.alergias ? '1px solid #ff4444' : 'none',
                        backgroundColor: nuevoPaciente.alergias ? '#fff5f5' : '#fff' 
                      }} 
                      value={nuevoPaciente.alergias} 
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, alergias: e.target.value })} 
                    />

                    <button 
                      type="submit" 
                      disabled={!esValido()} 
                      style={{ ...btnLarge, backgroundColor: esValido() ? '#4CAF50' : '#555' }}
                    >
                      {nuevoPaciente.id 
                        ? '💾 ' + (idioma === 'es' ? 'Actualizar' : 'Update') 
                        : '➕ ' + (idioma === 'es' ? 'Añadir' : 'Add')}
                    </button>
      
                    {nuevoPaciente.id && (
                      <button 
                        type="button" 
                        onClick={() => setNuevoPaciente({ id: null, nombre: '', dni: '', telefono: '', alergias: '' })} 
                        style={{ marginLeft: '10px', background: 'none', color: 'gray', border: 'none', cursor: 'pointer' }}
                      >
                        {TEXTOS[idioma].volver}
                      </button>
                    )}
                  </form>

                  <table border="1" style={tableStyle}>
                    <thead>
                      <tr>
                        <th>{idioma === 'es' ? 'Nombre' : 'Name'}</th>
                        <th>{TEXTOS[idioma].placeholderDni}</th>
                        <th>{idioma === 'es' ? 'Acciones' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientes
                        .filter(p => p.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) || p.dni.includes(busquedaAdmin))
                        .map(p => (
                          <tr key={p.id}>
                            <td style={{ padding: '10px' }}>{p.nombre}</td>
                            <td>{p.dni}</td>
                            <td>
                              <button 
                                onClick={() => verHistoriaClinica(p)} 
                                style={{ color: '#2196F3', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                                title={idioma === 'es' ? "Ver Historia Clínica" : "View Medical History"}
                              >
                                📄
                              </button>
                              <button onClick={() => setNuevoPaciente(p)} style={{ color: 'orange', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                              <button onClick={() => eliminarPaciente(p.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
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
                    <input 
                      placeholder={idioma === 'es' ? "Nombre del Médico" : "Doctor's Name"} 
                      style={inputStyle} 
                      value={nuevoMedico.nombre} 
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })} 
                      required 
                    />
                    <input 
                      placeholder={idioma === 'es' ? "Especialidad" : "Specialty"} 
                      style={inputStyle} 
                      value={nuevoMedico.especialidad} 
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, especialidad: e.target.value })} 
                      required 
                    />
                    <input 
                      placeholder={idioma === 'es' ? "Matrícula" : "Medical License"} 
                      style={inputStyle} 
                      value={nuevoMedico.matricula} 
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, matricula: e.target.value })} 
                      required 
                    />
                    <input 
                      placeholder={idioma === 'es' ? "Consultorio / Piso" : "Office / Floor"} 
                      style={inputStyle} 
                      value={nuevoMedico.consultorio} 
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, consultorio: e.target.value })} 
                    />
                    <input 
                      placeholder={idioma === 'es' ? "Teléfono" : "Phone"} 
                      style={inputStyle} 
                      value={nuevoMedico.telefono} 
                      onChange={(e) => setNuevoMedico({ ...nuevoMedico, telefono: e.target.value })} 
                      required 
                    />

                    <button type="submit" style={btnLarge}>
                      {nuevoMedico.id 
                        ? (idioma === 'es' ? '💾 Actualizar' : '💾 Update') 
                        : (idioma === 'es' ? '➕ Añadir' : '➕ Add')}
                      </button>
  
                      {nuevoMedico.id && (
                        <button 
                          type="button" 
                          onClick={() => setNuevoMedico({ id: null, nombre: '', especialidad: '', telefono: '', matricula: '', consultorio: '' })} 
                          style={{ marginLeft: '10px', background: 'none', color: 'gray', border: 'none', cursor: 'pointer' }}
                        >
                          {idioma === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                      )}
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

              {/* --- VISTA SALA DE ESPERA (MODO TV) --- */}
              {vista === 'tv' && (
                <section style={{ backgroundColor: '#000', minHeight: '80vh', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
                  <h2 style={{ color: '#4CAF50', fontSize: '40px', marginBottom: '40px' }}>{idioma === 'es' ? 'SALA DE ESPERA' : 'WAITING ROOM'}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '30px', fontWeight: 'bold' }}>
                    <div style={{ color: '#aaa', borderBottom: '1px solid #444' }}>{idioma === 'es' ? 'PACIENTE' : 'PATIENT'}</div>
                    <div style={{ color: '#aaa', borderBottom: '1px solid #444' }}>{idioma === 'es' ? 'CONSULTORIO' : 'OFFICE'}</div>
                    {turnos.filter(t => t.fecha === hoy && t.estado === 'Confirmado').map(t => (
                      <React.Fragment key={t.id}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>{t.paciente}</div>
                        <div style={{ padding: '20px', borderBottom: '1px solid #222', color: '#4CAF50' }}>{t.consultorio || 'S/D'}</div>
                      </React.Fragment>
                    ))}
                  </div>
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
                      <p>
                        Dr. {t.medico} 
                        {t.consultorio && (
                          <span style={{ color: '#4CAF50', marginLeft: '10px', fontSize: '14px' }}>
                            📍 {idioma === 'es' ? 'Consultorio' : 'Office'}: {t.consultorio}
                          </span>
                        )}
                      </p>
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