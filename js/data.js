
const generateId = () => 't' + Math.random().toString(36).slice(2,9);
const persist = () => localStorage.setItem('todo.tasks', JSON.stringify(tasks));


const loadFromStorage = () => {
  const raw = localStorage.getItem('todo.tasks');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const fmtDate = (iso, fallback='-') => iso ? dayjs(iso).format('DD/MM/YYYY') : fallback;


async function loadRemoteTasks(){
  try {
    const resp = await fetch('./data/tasks.json', {cache: "no-store"});
    if (!resp.ok) throw new Error('tasks.json no disponible');
    const data = await resp.json();
    return data;
  } catch (err) {
    console.warn('No se pudo obtener tasks.json, usando datos por defecto.', err);
    return [
      { id: generateId(), title: 'Tarea demo A', description: 'Fallback', status: 'por hacer', createdAt: new Date().toISOString(), due: null }
    ];
  }
}

/* Funsiones de orden superior */
function createStatusUpdater(newStatus) {
  return function updateStatusById(taskId) {
    const t = tasks.find(t => t.id === taskId);
    if (t) {
      t.status = newStatus;
      persist();
      renderTasks();
    }
  };
}

function computeSummary() {
  const total = tasks.length;
  const byStatus = {
    'por hacer': tasks.filter(t => t.status === 'por hacer').length,
    'no realizada': tasks.filter(t => t.status === 'no realizada').length,
    'completada': tasks.filter(t => t.status === 'completada').length
  };
  return { total, byStatus };
}
