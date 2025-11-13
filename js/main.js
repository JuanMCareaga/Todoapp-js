
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];


function guardarEnStorage() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function renderTareas() {
  const lista = document.getElementById("listaTareas");
  lista.innerHTML = ""; 

  if (tareas.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay tareas todavía.";
    li.style.fontStyle = "italic";
    lista.appendChild(li);
    return;
  }

  tareas.forEach((tarea, index) => {
    const li = document.createElement("li");
    li.textContent = tarea.texto;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.addEventListener("click", () => eliminarTarea(index));

    li.appendChild(btnEliminar);
    lista.appendChild(li);
  });
}

function agregarTarea() {
  const input = document.getElementById("nuevaTareaInput");
  const texto = input.value.trim();

  if (texto === "") return;

  const nuevaTarea = { texto };
  tareas.push(nuevaTarea);
  guardarEnStorage();
  renderTareas();

  input.value = "";
}

function eliminarTarea(index) {
  tareas.splice(index, 1);
  guardarEnStorage();
  renderTareas();
}


document.getElementById("agregarBtn").addEventListener("click", agregarTarea);


renderTareas();
