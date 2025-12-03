
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


function makeStatusBadge(status){
  const cls = status === 'por hacer' ? 'por-hacer' :
              status === 'no realizada' ? 'no-realizada' : 'completada';
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = status;
  return span;
}

function renderTasks(){
  const q = searchInput.value.trim().toLowerCase();
  const filter = filterStatus.value;

  const visible = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (q && !t.title.toLowerCase().includes(q)) return false;
    return true;
  });

  tasksContainer.innerHTML = '';

  const s = computeSummary();
  summary.innerHTML = `<div class="small-muted">Tareas: ${s.total} — Por hacer: ${s.byStatus['por hacer']} — No realizada: ${s.byStatus['no realizada']} — Completadas: ${s.byStatus['completada']}</div>`;

  if (visible.length === 0) {
    tasksContainer.innerHTML = `<div class="small-muted">No hay tareas que mostrar.</div>`;
    return;
  }

  visible.map(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.id;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    meta.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'task-desc';
    desc.textContent = task.description || '';
    meta.appendChild(desc);

    const dates = document.createElement('div');
    dates.className = 'small-muted';
    dates.textContent = `Creada: ${fmtDate(task.createdAt)} ${task.due ? '· Vence: ' + fmtDate(task.due) : ''}`;
    meta.appendChild(dates);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const select = document.createElement('select');
    select.className = 'status-select';
    ['por hacer','no realizada','completada'].forEach(sv => {
      const opt = document.createElement('option');
      opt.value = sv;
      opt.textContent = sv;
      if (sv === task.status) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', (e) => {
      task.status = e.target.value;
      persist();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        timer: 1000,
        showConfirmButton: false
      });
      renderTasks();
    });
    actions.appendChild(select);

    const editBtn = document.createElement('button');
    editBtn.title = 'Editar';
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editBtn.addEventListener('click', () => toggleEditMode(card, task));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.title = 'Eliminar';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.addEventListener('click', () => {
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
    });
    actions.appendChild(delBtn);

    const badge = makeStatusBadge(task.status);
    actions.appendChild(badge);

    card.appendChild(meta);
    card.appendChild(actions);
    tasksContainer.appendChild(card);
  });
}


function toggleEditMode(card,task) {
  Swal.fire({
    title: 'Editar tarea',
    html: `
        <input id="swal-title" class="swal2-input" value="${task.title}">
        <textarea id="swal-desc" class="swal2-textarea">${task.description || ""}</textarea>
        <input id="swal-due" type="date" class="swal2-input" value="${task.due || ""}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      return {
        title: document.getElementById('swal-title').value.trim(),
        desc: document.getElementById('swal-desc').value.trim(),
        due: document.getElementById('swal-due').value
      };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const { title, desc, due } = result.value;

      if (!title) {
        Swal.fire({
          icon: 'error',
          title: 'El título es obligatorio'
        });
        return;
      }

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

/* ---------------------------
   Formulario: crear tarea
   --------------------------- */

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    Swal.fire({
      icon: 'error',
      title: 'El título es obligatorio'
    });
    return;
  }

  const newTask = {
    id: generateId(),
    title,
    description: descInput.value.trim(),
    status: initialStatus.value,
    createdAt: new Date().toISOString(),
    due: dueInput.value || null
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




function debounce(fn, wait = 200){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}


(async function init(){
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
