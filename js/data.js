
const generateId = () => 't' + Math.random().toString(36).slice(2,9);
const persist = () => localStorage.setItem('todo.tasks', JSON.stringify(tasks));

/* Cargar tareas desde localStorage */

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


/* Resumen de tareas en el navbar */

function computeSummary() {
  const total = tasks.length;
  const byStatus = {
    'por hacer': tasks.filter(task => task.status === 'por hacer').length,
    'no realizada': tasks.filter(task => task.status === 'no realizada').length,
    'completada': tasks.filter(task => task.status === 'completada').length
  };
  return { total, byStatus };
}
