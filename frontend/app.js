// ══════════════════════════════════════════════════════════════
//  MediDesk — app.js
// ══════════════════════════════════════════════════════════════

const LOGIN_ENDPOINT = '/api/usuarios/login';
const API = window.location.origin;

// ── PERMISOS POR ROL ──────────────────────────────────────────
const PERMISOS = {
  admin:   ['dashboard','citas','estados','usuarios','nuevo-usuario','nueva-cita','eliminar-cita','eliminar-usuario','cambiar-estado'],
  tecnico: ['dashboard','citas','estados','usuarios','nueva-cita','eliminar-cita','cambiar-estado'],
  usuario: ['dashboard','citas','nueva-cita']  // ✅ sin cambiar-estado
};

function puedePor(accion) {
  const rol = localStorage.getItem('rol') || 'usuario';
  return (PERMISOS[rol] || []).includes(accion);
}

function normalizarRol(rol) {
  if (!rol) return 'usuario';
  if (rol === 'paciente') return 'usuario';
  if (['admin','tecnico','usuario'].includes(rol)) return rol;
  return 'usuario';
}

// ── SESIÓN ───────────────────────────────────────────────────
function verificarSesion() {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('login').style.display    = 'none';
    document.getElementById('sistema').classList.remove('hidden');
    aplicarPermisosSidebar();
    cargarPacientes();
    mostrarDashboard();
  } else {
    document.getElementById('login').style.display    = 'flex';
    document.getElementById('sistema').classList.add('hidden');
  }
}

function aplicarPermisosSidebar() {
  const rol      = localStorage.getItem('rol') || 'usuario';
  const permisos = PERMISOS[rol] || [];

  const navMap = {
    'nav-inicio':        'dashboard',
    'nav-citas':         'citas',
    'nav-estados':       'estados',
    'nav-usuarios':      'usuarios',
    'nav-nuevo-usuario': 'nuevo-usuario',
    'nav-nueva-cita':    'nueva-cita'
  };

  Object.entries(navMap).forEach(([id, accion]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.style.display = permisos.includes(accion) ? '' : 'none';
  });

  const colores  = { admin: '#1a6ef5', tecnico: '#6b21a8', usuario: '#15803d' };
  const color    = colores[rol] || '#9aa3b0';
  const badgeEl  = document.getElementById('rol-badge-sidebar');
  if (badgeEl) {
    badgeEl.innerHTML = `<span style="background:${color}22;color:${color};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${rol.toUpperCase()}</span>`;
  }
}

function limpiarPantalla() {
  document.getElementById('contenido').innerHTML = '';
  document.getElementById('tablaContainer').classList.add('hidden');
  document.getElementById('formCita').classList.add('hidden');
  document.getElementById('formUsuario').classList.add('hidden');
}

function setActiveNav(id) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── AUTH ─────────────────────────────────────────────────────
function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('login-error');

  if (errEl) errEl.textContent = '';

  if (!email || !password) {
    if (errEl) errEl.textContent = 'Ingresa correo y contraseña.';
    return;
  }

  fetch(`${API}${LOGIN_ENDPOINT}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');
    return data;
  })
  .then(data => {
    const usuario = data.usuario || data.user || {};
    if (!data.token) throw new Error('El servidor no devolvió un token.');

    localStorage.setItem('token',    data.token);
    localStorage.setItem('rol',      normalizarRol(usuario.rol));
    localStorage.setItem('userId',   usuario.id     || '');
    localStorage.setItem('userName', usuario.nombre || usuario.name || '');

    verificarSesion();
  })
  .catch(error => {
    console.error('Login error:', error);
    if (errEl) errEl.textContent = error.message;
    else alert(error.message);
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  const emailEl = document.getElementById('email');
  const passEl  = document.getElementById('password');
  if (emailEl) emailEl.value = '';
  if (passEl)  passEl.value  = '';
  verificarSesion();
}

// ── DASHBOARD ────────────────────────────────────────────────
function mostrarDashboard() {
  limpiarPantalla();
  setActiveNav('nav-inicio');
  document.getElementById('page-title').textContent  = 'Inicio';
  document.getElementById('stats-bar').style.display = 'grid';

  const nombre = localStorage.getItem('userName') || '';
  const rol    = localStorage.getItem('rol')      || 'usuario';

  document.getElementById('contenido').innerHTML = `
    <div class="welcome-card">
      <h2>Bienvenido${nombre ? ', ' + nombre : ''}</h2>
      <p>Acceso como <strong>${rol}</strong> — ${descripcionRol(rol)}</p>
    </div>`;
}

function descripcionRol(rol) {
  const d = {
    admin:   'acceso completo al sistema',
    tecnico: 'gestión de citas y consulta de usuarios',
    usuario: 'consulta y creación de tus propias citas'
  };
  return d[rol] || '';
}

// ── FORMULARIOS ──────────────────────────────────────────────
function toggleFormulario() {
  if (!puedePor('nueva-cita')) return alert('No tienes permiso para crear citas');
  setActiveNav('nav-nueva-cita');
  document.getElementById('page-title').textContent  = 'Nueva cita';
  document.getElementById('stats-bar').style.display = 'none';
  limpiarPantalla();
  document.getElementById('formCita').classList.remove('hidden');

  const fechaInput = document.getElementById('fecha');
  if (fechaInput) fechaInput.valueAsDate = new Date();

  const sEl = document.getElementById('paciente_search');
  const hEl = document.getElementById('paciente_id');
  const nEl = document.getElementById('paciente_hint');
  if (sEl) sEl.value = '';
  if (hEl) hEl.value = '';
  if (nEl) nEl.textContent = 'Selecciona de la lista o escribe un nombre nuevo';

  cargarPacientes();
  ajustarCampoPaciente();
}

function toggleFormularioUsuario() {
  if (!puedePor('nuevo-usuario')) return alert('No tienes permiso para crear usuarios');
  setActiveNav('nav-nuevo-usuario');
  document.getElementById('page-title').textContent  = 'Nuevo usuario';
  document.getElementById('stats-bar').style.display = 'none';
  limpiarPantalla();
  document.getElementById('formUsuario').classList.remove('hidden');
}

// ── AJUSTAR CAMPO PACIENTE SEGÚN ROL ─────────────────────────
function ajustarCampoPaciente() {
  const rol       = localStorage.getItem('rol') || 'usuario';
  const nombre    = localStorage.getItem('userName') || '';
  const buscador  = document.getElementById('paciente-field-buscador');
  const fijo      = document.getElementById('paciente-field-fijo');
  const fijoInput = document.getElementById('paciente_nombre_fijo');
  if (!buscador || !fijo) return;

  if (rol === 'usuario') {
    buscador.style.display = 'none';
    fijo.style.display     = '';
    if (fijoInput) fijoInput.value = nombre || 'Mi cuenta';
  } else {
    buscador.style.display = '';
    fijo.style.display     = 'none';
  }
}

// ── PACIENTES — buscador con autocompletado ───────────────────
let _pacientesCache = [];

function cargarPacientes() {
  fetch(`${API}/api/usuarios`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(res => {
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) return null;
    return res.json();
  })
  .then(response => {
    if (!response) return;
    _pacientesCache = Array.isArray(response)
      ? response
      : (response.data || response.usuarios || []);
  })
  .catch(err => console.error('Error al cargar pacientes:', err));
}

function filtrarPacientes() {
  const input    = document.getElementById('paciente_search');
  const dropdown = document.getElementById('paciente_dropdown');
  const hiddenId = document.getElementById('paciente_id');
  const hint     = document.getElementById('paciente_hint');
  if (!input || !dropdown) return;

  const texto = input.value.trim();
  hiddenId.value = '';

  const resultados = texto.length === 0
    ? _pacientesCache
    : _pacientesCache.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase()));

  dropdown.innerHTML = '';

  if (resultados.length > 0) {
    resultados.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p.nombre;
      li.style.cssText = 'padding:9px 13px;cursor:pointer;font-size:14px;color:var(--text);transition:background 0.1s;';
      li.addEventListener('mousedown', () => {
        input.value    = p.nombre;
        hiddenId.value = p.id;
        if (hint) hint.textContent = '✓ Paciente registrado seleccionado';
        dropdown.style.display = 'none';
      });
      li.addEventListener('mouseover', () => li.style.background = 'var(--blue-light)');
      li.addEventListener('mouseout',  () => li.style.background = '');
      dropdown.appendChild(li);
    });
  } else if (texto.length > 0) {
    const li = document.createElement('li');
    li.style.cssText = 'padding:9px 13px;font-size:13px;color:var(--text3);font-style:italic;';
    li.textContent = `"${texto}" — nombre nuevo`;
    dropdown.appendChild(li);
    if (hint) hint.textContent = 'Se guardará como nombre libre (sin ID de usuario)';
  }

  dropdown.style.display = dropdown.children.length > 0 ? 'block' : 'none';
}

function mostrarDropdown() {
  const input    = document.getElementById('paciente_search');
  const dropdown = document.getElementById('paciente_dropdown');
  if (!input || !dropdown) return;
  if (input.value.trim() === '' && _pacientesCache.length > 0) filtrarPacientes();
  if (dropdown.children.length > 0) dropdown.style.display = 'block';
}

function ocultarDropdown() {
  setTimeout(() => {
    const dropdown = document.getElementById('paciente_dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }, 150);
}

// ── USUARIOS ─────────────────────────────────────────────────
function cargarUsuarios() {
  if (!puedePor('usuarios')) return alert('No tienes permiso para ver usuarios');
  setActiveNav('nav-usuarios');
  document.getElementById('page-title').textContent  = 'Usuarios';
  document.getElementById('stats-bar').style.display = 'none';
  limpiarPantalla();

  fetch(`${API}/api/usuarios`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(res => {
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) return null;
    return res.json();
  })
  .then(response => {
    if (!response) return;
    const usuarios = Array.isArray(response) ? response : (response.data || []);
    const totalEl  = document.getElementById('totalUsuarios');
    if (totalEl) totalEl.textContent = usuarios.length;

    const contenido = document.getElementById('contenido');

    if (usuarios.length === 0) {
      contenido.innerHTML = '<div class="empty-state"><p>No hay usuarios registrados</p></div>';
      return;
    }

    contenido.innerHTML = '<div class="usuarios-grid"></div>';
    const grid = contenido.querySelector('.usuarios-grid');

    usuarios.forEach(u => {
      const iniciales     = (u.nombre || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const colores       = { admin: '#1a6ef5', tecnico: '#6b21a8', usuario: '#15803d' };
      const color         = colores[u.rol] || '#9aa3b0';
      const puedeEliminar = puedePor('eliminar-usuario');

      const card = document.createElement('div');
      card.className = 'usuario-card';
      card.innerHTML = `
        <div class="flex">
          <div class="usuario-avatar" style="background:${color}22;color:${color};">${iniciales}</div>
          <div class="usuario-info">
            <h4>${u.nombre}</h4>
            <p>${u.email}</p>
          </div>
        </div>
        <div class="flex" style="justify-content:space-between;">
          <span class="rol-badge" style="background:${color}22;color:${color};">${u.rol || 'usuario'}</span>
          ${puedeEliminar
            ? `<button class="btn btn-danger" style="padding:4px 10px;font-size:12px;" data-id="${u.id}">Eliminar</button>`
            : ''}
        </div>`;

      if (puedeEliminar) {
        card.querySelector('button').addEventListener('click', () => eliminarUsuario(u.id));
      }

      grid.appendChild(card);
    });
  })
  .catch(err => console.error('Error al cargar usuarios:', err));
}

function crearUsuario() {
  if (!puedePor('nuevo-usuario')) return alert('No tienes permiso');
  const nombre   = document.getElementById('nuevoNombre').value.trim();
  const email    = document.getElementById('nuevoEmail').value.trim();
  const password = document.getElementById('nuevoPassword').value;
  const rol      = document.getElementById('nuevoRol').value;

  if (!nombre || !email || !password) return alert('Completa todos los campos');

  fetch(`${API}/api/usuarios`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    body:    JSON.stringify({ nombre, email, password, rol })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
    return data;
  })
  .then(() => {
    alert('Usuario creado ✅');
    document.getElementById('nuevoNombre').value   = '';
    document.getElementById('nuevoEmail').value    = '';
    document.getElementById('nuevoPassword').value = '';
    cargarUsuarios();
    cargarPacientes();
  })
  .catch(error => { console.error(error); alert(error.message); });
}

function eliminarUsuario(id) {
  if (!puedePor('eliminar-usuario')) return alert('No tienes permiso');
  if (!confirm('¿Eliminar este usuario?')) return;

  fetch(`${API}/api/usuarios/${id}`, {
    method:  'DELETE',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
    return data;
  })
  .then(() => { cargarUsuarios(); cargarPacientes(); })
  .catch(error => { console.error(error); alert(error.message); });
}

// ── CITAS ────────────────────────────────────────────────────
function obtenerCitas() {
  if (!puedePor('citas')) return alert('No tienes permiso para ver citas');
  setActiveNav('nav-citas');
  document.getElementById('page-title').textContent  = 'Citas';
  document.getElementById('stats-bar').style.display = 'grid';
  limpiarPantalla();
  document.getElementById('tablaContainer').classList.remove('hidden');

  fetch(`${API}/api/citas?t=${Date.now()}`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(res => {
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) return null;
    return res.json();
  })
  .then(response => {
    if (!response) return;
    const citas   = response.data || [];
    const totalEl = document.getElementById('totalCitas');
    if (totalEl) totalEl.textContent = citas.length;

    const tbody = document.querySelector('#tablaCitas tbody');
    tbody.innerHTML = '';

    if (citas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>No hay citas registradas</p></div></td></tr>';
      return;
    }

    const puedeEliminar      = puedePor('eliminar-cita');
    const puedeCambiarEstado = puedePor('cambiar-estado');

    citas.forEach(cita => {
      const fecha  = new Date(cita.fecha).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
      const hora   = cita.hora   ? cita.hora.substring(0, 5) : '—';
      const motivo = cita.motivo || '—';

      const tr = document.createElement('tr');

      let estadoCelda;
      if (puedeCambiarEstado) {
        estadoCelda = document.createElement('td');
        const sel   = document.createElement('select');
        sel.className = 'estado-select';
        [['pendiente','⏳ Pendiente'],['completada','✅ Completada'],['cancelada','❌ Cancelada']].forEach(([val, label]) => {
          const opt       = document.createElement('option');
          opt.value       = val;
          opt.textContent = label;
          if (cita.estado === val) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', () => cambiarEstado(cita.id, sel.value));
        estadoCelda.appendChild(sel);
      } else {
        // ✅ Usuario ve badge de solo lectura
        estadoCelda = document.createElement('td');
        estadoCelda.innerHTML = `<span class="badge badge-${cita.estado}"><span class="dot"></span>${cita.estado}</span>`;
      }

      tr.innerHTML = `
        <td style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text2);">#${cita.id}</td>
        <td style="font-weight:500;">${cita.paciente || 'Sin nombre'}</td>
        <td style="color:var(--text2);">${fecha}</td>
        <td style="font-family:'DM Mono',monospace;color:var(--text2);">${hora}</td>
        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${motivo}">${motivo}</td>`;
      tr.appendChild(estadoCelda);
      tr.innerHTML += `
        <td><span class="badge badge-${cita.prioridad || 'media'}">${cita.prioridad || 'media'}</span></td>
        <td><span class="badge badge-${cita.categoria || 'general'}">${cita.categoria || 'general'}</span></td>`;

      const tdAcc = document.createElement('td');
      if (puedeEliminar) {
        const btnEl = document.createElement('button');
        btnEl.className     = 'btn btn-danger';
        btnEl.style.cssText = 'padding:5px 12px;font-size:12px;';
        btnEl.textContent   = 'Eliminar';
        btnEl.addEventListener('click', () => eliminarCita(cita.id));
        tdAcc.appendChild(btnEl);
      } else {
        tdAcc.textContent = '—';
      }
      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    console.error('Error al cargar citas:', error);
    const tbody = document.querySelector('#tablaCitas tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>Error al cargar citas</p></div></td></tr>';
  });
}

// ── CAMBIAR ESTADO ────────────────────────────────────────────
function cambiarEstado(id, estado) {
  if (!puedePor('cambiar-estado')) return alert('No tienes permiso');

  fetch(`${API}/api/citas/${id}/estado`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    body:    JSON.stringify({ estado })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cambiar estado');
    return data;
  })
  .then(() => obtenerCitas())
  .catch(error => { console.error(error); alert(error.message); });
}

// ── GUARDAR CITA ──────────────────────────────────────────────
function guardarCita() {
  if (!puedePor('nueva-cita')) return alert('No tienes permiso');

  const rol = localStorage.getItem('rol') || 'usuario';

  let paciente_id     = '';
  let paciente_nombre = '';

  if (rol === 'usuario') {
    paciente_id     = localStorage.getItem('userId')   || '';
    paciente_nombre = localStorage.getItem('userName') || '';
  } else {
    paciente_id     = (document.getElementById('paciente_id')?.value     || '').trim();
    paciente_nombre = (document.getElementById('paciente_search')?.value || '').trim();
  }

  const fecha     = document.getElementById('fecha').value;
  const hora      = document.getElementById('hora').value;
  const motivo    = document.getElementById('motivo').value.trim();
  const estado    = document.getElementById('estado').value;
  const prioridad = document.getElementById('prioridad').value;
  const categoria = document.getElementById('categoria').value;

  if (!paciente_id && !paciente_nombre) return alert('Escribe o selecciona un paciente');
  if (!fecha)  return alert('Selecciona una fecha');
  if (!hora)   return alert('Selecciona una hora');
  if (!motivo) return alert('Ingresa el motivo de la cita');

  const body = { fecha, hora, motivo, estado, prioridad, categoria };
  if (paciente_id) {
    body.paciente_id = paciente_id;
  } else {
    body.paciente_nombre = paciente_nombre;
  }

  fetch(`${API}/api/citas`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    body:    JSON.stringify(body)
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear cita');
    return data;
  })
  .then(() => {
    alert('Cita creada ✅');
    const searchEl = document.getElementById('paciente_search');
    const hiddenEl = document.getElementById('paciente_id');
    const hintEl   = document.getElementById('paciente_hint');
    if (searchEl) searchEl.value = '';
    if (hiddenEl) hiddenEl.value = '';
    if (hintEl)   hintEl.textContent = 'Selecciona de la lista o escribe un nombre nuevo';
    obtenerCitas();
  })
  .catch(error => { console.error(error); alert(error.message); });
}

// ── ELIMINAR CITA ─────────────────────────────────────────────
function eliminarCita(id) {
  if (!puedePor('eliminar-cita')) return alert('No tienes permiso');
  if (!confirm('¿Eliminar esta cita?')) return;

  fetch(`${API}/api/citas/${id}`, {
    method:  'DELETE',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar cita');
    return data;
  })
  .then(() => obtenerCitas())
  .catch(error => { console.error(error); alert(error.message); });
}

// ── ESTADOS ───────────────────────────────────────────────────
function mostrarPorEstado() {
  if (!puedePor('estados')) return alert('No tienes permiso');
  setActiveNav('nav-estados');
  document.getElementById('page-title').textContent  = 'Estados';
  document.getElementById('stats-bar').style.display = 'none';
  limpiarPantalla();

  fetch(`${API}/api/citas`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  })
  .then(res => {
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) return null;
    return res.json();
  })
  .then(response => {
    if (!response) return;
    const citas  = response.data || [];
    const grupos = {
      pendiente:  citas.filter(c => c.estado === 'pendiente'),
      completada: citas.filter(c => c.estado === 'completada'),
      cancelada:  citas.filter(c => c.estado === 'cancelada')
    };
    const clases  = { pendiente: 'badge-pendiente', completada: 'badge-completada', cancelada: 'badge-cancelada' };
    const nombres = { pendiente: 'Pendientes',      completada: 'Completadas',      cancelada: 'Canceladas' };

    const contenido = document.getElementById('contenido');
    contenido.innerHTML = '<div class="estados-grid"></div>';
    const grid = contenido.querySelector('.estados-grid');

    for (const [estado, lista] of Object.entries(grupos)) {
      const col = document.createElement('div');
      col.className = 'estado-col';
      col.innerHTML = `
        <div class="estado-col-header">
          <span class="badge ${clases[estado]}">${lista.length}</span>
          ${nombres[estado]}
        </div>
        <div class="estado-col-body" id="col-${estado}"></div>`;
      grid.appendChild(col);
    }

    for (const [estado, lista] of Object.entries(grupos)) {
      const colBody = document.getElementById(`col-${estado}`);
      if (lista.length === 0) {
        colBody.innerHTML = '<p style="font-size:13px;color:var(--text3);padding:8px;">Sin citas</p>';
        continue;
      }
      lista.forEach(c => {
        colBody.innerHTML += `
          <div class="cita-mini">
            <h4>${c.paciente || 'Sin nombre'}</h4>
            <p>${new Date(c.fecha).toLocaleDateString('es-MX')} · ${c.hora ? c.hora.substring(0,5) : '—'}</p>
            <p style="margin-top:4px;color:var(--text2);font-size:12px;">${c.motivo || '—'}</p>
            <div class="flex" style="margin-top:8px;gap:6px;">
              <span class="badge badge-${c.prioridad || 'media'}" style="font-size:11px;">${c.prioridad || 'media'}</span>
              <span class="badge badge-${c.categoria || 'general'}" style="font-size:11px;">${c.categoria || 'general'}</span>
            </div>
          </div>`;
      });
    }
  })
  .catch(err => { console.error(err); alert('Error al cargar estados'); });
}

// ── FILTRO ────────────────────────────────────────────────────
function filtrarCitas() {
  const input = document.getElementById('busqueda');
  if (!input) return;
  const filtro = input.value.toLowerCase();
  document.querySelectorAll('#tablaCitas tbody tr').forEach(fila => {
    fila.style.display = fila.innerText.toLowerCase().includes(filtro) ? '' : 'none';
  });
}

// ── DARK MODE ─────────────────────────────────────────────────
function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// ── RELOJ ─────────────────────────────────────────────────────
function actualizarReloj() {
  const reloj = document.getElementById('reloj');
  if (!reloj) return;
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
  const hora  = ahora.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  reloj.textContent = `${fecha} · ${hora}`;
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

// ── INICIO ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', verificarSesion);