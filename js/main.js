
const tasksContainer = document.getElementById('tasksContainer');
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const dueInput = document.getElementById('dueInput');
const initialStatus = document.getElementById('initialStatus');
const filterStatus = document.getElementById('filterStatus');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const summary = document.getElementById('summary');

let tasks = [];


function makeStatusBadge(status) {
  const cls = status === 'por hacer' ? 'por-hacer' :
    status === 'no realizada' ? 'no-realizada' : 'completada';
  return `<span class="badge ${cls}">${status}</span>`;
}

function renderTasks() {
  const searchQuery = searchInput.value.trim().toLowerCase();
  const filter = filterStatus.value;

  const visibleTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  const summaryData = computeSummary();
  summary.innerHTML = `<div class="small-muted">Tareas: ${summaryData.total} — Por hacer: ${summaryData.byStatus['por hacer']} — No realizada: ${summaryData.byStatus['no realizada']} — Completadas: ${summaryData.byStatus['completada']}</div>`;

  if (visibleTasks.length === 0) {
    tasksContainer.innerHTML = `<div class="small-muted">No hay tareas que mostrar.</div>`;
    return;
  }

  /* Renderizar tareas */

  tasksContainer.innerHTML = visibleTasks.map(task => {
    const isDue = task.due ? `· Vence: ${fmtDate(task.due)}` : '';
    const statusOptions = ['por hacer', 'no realizada', 'completada'].map(statusValue =>
      `<option value="${statusValue}" ${statusValue === task.status ? 'selected' : ''}>${statusValue}</option>`
    ).join('');

    return `
    <div class="task-card" data-id="${task.id}">
      <div class="task-meta">
        <div class="task-title">${task.title}</div>
        <div class="task-desc">${task.description || ''}</div>
        <div class="small-muted">Creada: ${fmtDate(task.createdAt)} ${isDue}</div>
      </div>
      <div class="task-actions">
        <select class="status-select" data-id="${task.id}">
          ${statusOptions}
        </select>
        <button class="btn-edit" data-id="${task.id}" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="btn-delete" data-id="${task.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        ${makeStatusBadge(task.status)}
      </div>
    </div>
    `;
  }).join('');
}

/* Manejo de eventos en tareas */

tasksContainer.addEventListener('change', (e) => {
  if (e.target.classList.contains('status-select')) {
    const taskId = e.target.dataset.id;
    const newStatus = e.target.value;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      persist();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1000,
        showConfirmButton: false
      });
      renderTasks();
    }
  }
});

/* Manejo de botones Editar y Eliminar */

tasksContainer.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.btn-edit');
  const deleteBtn = e.target.closest('.btn-delete');

  if (editBtn) {
    const taskId = editBtn.dataset.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) toggleEditMode(task);
  }

  if (deleteBtn) {
    const taskId = deleteBtn.dataset.id;
    const task = tasks.find(t => t.id === taskId);
    if (task) confirmDelete(task);
  }
});

function confirmDelete(task) {
  Swal.fire({
    title: '¿Eliminar tarea?',
    text: 'No podrás deshacer esta acción',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = tasks.filter(t => t.id !== task.id);
      persist();
      renderTasks();
      Swal.fire({
        icon: 'success',
        title: 'Tarea eliminada',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
}

/* Modo edición de tareas */

function toggleEditMode(task) {
  const today = new Date().toISOString().split('T')[0];
  Swal.fire({
    title: 'Editar tarea',
    html: `
        <input id="swal-title" class="swal2-input" value="${task.title}">
        <textarea id="swal-desc" class="swal2-textarea">${task.description || ""}</textarea>
        <input id="swal-due" type="date" class="swal2-input" value="${task.due || ""}" min="${today}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const title = document.getElementById('swal-title').value.trim();
      const desc = document.getElementById('swal-desc').value.trim();
      const due = document.getElementById('swal-due').value;
      const todayDate = new Date().toISOString().split('T')[0];

      if (!title) {
        Swal.showValidationMessage('El título es obligatorio');
        return false;
      }

      if (due && due < todayDate) {
        Swal.showValidationMessage('La fecha de vencimiento no puede ser anterior a hoy.');
        return false;
      }

      return { title, desc, due };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const { title, desc, due } = result.value;

      task.title = title;
      task.description = desc;
      task.due = due || null;

      persist();
      renderTasks();

      Swal.fire({
        icon: 'success',
        title: 'Tarea editada',
        timer: 1200,
        showConfirmButton: false
      });
    }
  });
}

/* Manejo del formulario de creación */

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const due = dueInput.value;
  const today = new Date().toISOString().split('T')[0];

  if (!title) {
    Swal.fire({
      icon: 'error',
      title: 'El título es obligatorio'
    });
    return;
  }

  if (due && due < today) {
    Swal.fire({
      icon: 'error',
      title: 'Fecha inválida',
      text: 'La fecha de vencimiento no puede ser anterior a hoy.'
    });
    return;
  }

  const newTask = {
    id: generateId(),
    title,
    description: descInput.value.trim(),
    status: initialStatus.value,
    createdAt: new Date().toISOString(),
    due: due || null
  };

  tasks.unshift(newTask);
  persist();
  taskForm.reset();
  renderTasks();

  Swal.fire({
    icon: 'success',
    title: 'Tarea agregada',
    timer: 1200,
    showConfirmButton: false
  });
});


/* Filtros y búsqueda */

filterStatus.addEventListener('change', renderTasks);
searchInput.addEventListener('input', debounce(renderTasks, 250));



clearBtn.addEventListener('click', () => {
  Swal.fire({
    title: '¿Borrar TODAS las tareas?',
    text: "No podrás deshacer esta acción",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Borrar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = [];
      persist();
      renderTasks();
      Swal.fire({
        icon: 'success',
        title: 'Tareas eliminadas',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
});


/* Cargar tareas de ejemplo desde JSON */

const loadExamplesBtn = document.getElementById('loadExamplesBtn');

loadExamplesBtn.addEventListener('click', async () => {
  Swal.fire({
    title: '¿Cargar tareas de ejemplo?',
    text: 'Esto reemplazará las tareas actuales.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Cargar ejemplos',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const resp = await fetch('./data/tasks.json', { cache: "no-store" });
        const data = await resp.json();

        tasks = data.map(t => ({
          id: t.id || generateId(),
          title: t.title || 'Sin título',
          description: t.description || '',
          status: t.status || 'por hacer',
          createdAt: t.createdAt || new Date().toISOString(),
          due: t.due || null
        }));

        persist();
        renderTasks();

        Swal.fire({
          icon: 'success',
          title: 'Tareas de ejemplo cargadas',
          timer: 1200,
          showConfirmButton: false
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar JSON',
          text: 'Verifica que "tasks.json" esté en la carpeta del proyecto.'
        });
      }
    }
  });
});


function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* correccion de fecha minima en dueInput */

(async function init() {
  const today = new Date().toISOString().split('T')[0];
  dueInput.min = today;

  const stored = loadFromStorage();
  if (stored && Array.isArray(stored)) {
    tasks = stored;
  } else {
    tasks = await loadRemoteTasks();
    tasks = tasks.map(t => ({
      id: t.id || generateId(),
      title: t.title || 'Sin título',
      description: t.description || '',
      status: t.status || 'por hacer',
      createdAt: t.createdAt || new Date().toISOString(),
      due: t.due || null
    }));
    persist();
  }
  renderTasks();
})();
