# 🧠 NoTeCuelgues
Una aplicación To-Do minimalista y funcional desarrollada con **HTML, CSS y JavaScript**, orientada a la gestión de tareas diarias.  
Incluye edición, estados, filtrado, persistencia local y carga de datos desde JSON.

---

## 🚀 Características principales

### ✔ Gestión completa de tareas
- Crear tareas con título y descripción  
- Editarlas desde un modal SweetAlert2  
- Eliminarlas con confirmación  
- Cambiar estado: **Por hacer**, **No realizada**, **Completada**

### ✔ Filtros dinámicos
Filtrado por estado desde un `<select>`, actualizado en tiempo real.

### ✔ Persistencia de datos
Las tareas se guardan en **LocalStorage**, para mantenerlas al recargar la página.

### ✔ Carga de tareas desde JSON
Incluye botón para **cargar tareas de ejemplo** desde `/data/tasks.json`, cumpliendo el requisito de datos remotos (fetch).

### ✔ SweetAlert2 para popups
Alertas modernas y amigables:
- Confirmación  
- Edición  
- Mensajes de estado  

### ✔ Diseño responsive
Adaptado para móviles con CSS Grid + media queries.

### ✔ Código modular
Separado en:
- `data.js` → lógica de datos, utilities, storage, fetch  
- `main.js` → lógica del DOM, UI, eventos  

---

## 🛠 Tecnologías utilizadas

- **HTML5**
- **CSS3 (Grid + responsive)**
- **JavaScript Vanilla**
- **SweetAlert2**
- **Day.js**
- **LocalStorage**
- **JSON data (fetch)**

---

## 📥 Instalación y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/NoTeCuelgues.git


