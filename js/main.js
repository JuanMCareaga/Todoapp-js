
let tareas = [];


function mostrarTareas() {
    if (tareas.length === 0) {
        alert("No hay tareas en la lista.");
    } else {
        let lista = " Tus tareas:\n";
        for (let i = 0; i < tareas.length; i++) {
            lista += `${i + 1}. ${tareas[i]}\n`;
        }
        alert(lista);
    }
}

function agregarTarea(tarea) {
    if (tarea.trim() !== "") {
        tareas.push(tarea);
        alert(` Tarea "${tarea}" agregada correctamente.`);
    } else {
        alert("No se puede agregar una tarea vacía.");
    }
}


function eliminarTarea(numero) {
    if (numero >= 1 && numero <= tareas.length) {
        const tareaEliminada = tareas.splice(numero - 1, 1);
        alert(`Tarea "${tareaEliminada}" eliminada.`);
    } else {
        alert(" Número de tarea inválido.");
    }
}


function iniciarToDoApp() {
    alert(" Bienvenido a tu To-Do App");

    let opcion = "";

    while (opcion !== "salir") {
        opcion = prompt(
           "Elige una opción:\n\n" +
            "1. Agregar tarea\n" +
            "2. Ver tareas\n" +
            "3. Eliminar tarea\n" +
            "Escribí 'salir' para terminar."
        );

        if (opcion === "1") {
            const nuevaTarea = prompt("Escribí la nueva tarea:");
            agregarTarea(nuevaTarea);

        } else if (opcion === "2") {
            mostrarTareas();

        } else if (opcion === "3") {
            if (tareas.length === 0) {
                alert("No hay tareas para eliminar.");
            } else {
                mostrarTareas();
                const numero = parseInt(prompt("Ingresá el número de la tarea que querés eliminar:"));
                eliminarTarea(numero);
            }

        } else if (opcion === "salir") {
            alert("¡Hasta luego!");
        } else {
            alert(" Opción no válida. Intentá de nuevo.");
        }
    }

    console.log("Tareas finales:", tareas);
}


iniciarToDoApp();
