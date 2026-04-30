const API = "http://localhost:3000";

window.onload = () => {
    cargarUsuarios();
    cargarTareas();
};

// ==================== FUNCIONES DE USUARIO ====================

async function crearUsuario() {
    const name = document.getElementById("userName").value.trim();
    if (name === "") return alert("❌ Error: El nombre no puede estar vacío");

    try {
        const res = await fetch(API + "/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        
        if (!res.ok) {
            return alert("❌ Error: " + (data.error || "No se pudo crear el usuario"));
        }
        
        document.getElementById("userName").value = "";
        console.log("✅ Usuario creado:", data);
        cargarUsuarios();
        cargarTareas();
    } catch (err) {
        alert("❌ Error de conexión: " + err.message);
    }
}

async function cargarUsuarios() {
    try {
        const res = await fetch(API + "/users");
        const data = await res.json();
        const lista = document.getElementById("listaUsuarios");
        const select = document.getElementById("userId");

        lista.innerHTML = "";
        select.innerHTML = '<option value="">-- Selecciona un usuario --</option>';

        if (data.length === 0) {
            lista.innerHTML = '<li class="empty-message">No hay usuarios registrados</li>';
            document.getElementById("userCounter").textContent = "0";
            return;
        }

        data.forEach(u => {
            lista.innerHTML += `<li><span><strong>#${u.id}</strong> - ${u.name}</span></li>`;
            select.innerHTML += `<option value="${u.id}">${u.name} (ID: ${u.id})</option>`;
        });
        
        document.getElementById("userCounter").textContent = data.length;
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
    }
}

// ==================== FUNCIONES DE TAREAS ====================

async function crearTarea() {
    const title = document.getElementById("taskTitle").value.trim();
    const user_id = document.getElementById("userId").value;

    if (title === "") return alert("❌ Error: La descripción de la tarea no puede estar vacía");
    if (user_id === "") return alert("❌ Error: Debes seleccionar un usuario");

    try {
        const res = await fetch(API + "/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, user_id: parseInt(user_id) })
        });
        const data = await res.json();
        
        if (!res.ok) {
            return alert("❌ Error: " + (data.error || "No se pudo crear la tarea"));
        }
        
        document.getElementById("taskTitle").value = "";
        document.getElementById("userId").value = "";
        console.log("✅ Tarea creada:", data);
        cargarTareas();
    } catch (err) {
        alert("❌ Error de conexión: " + err.message);
    }
}

async function cargarTareas() {
    try {
        const res = await fetch(API + "/tasks");
        const data = await res.json();
        const lista = document.getElementById("listaTareas");
        lista.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = '<li class="empty-message">No hay tareas registradas</li>';
            document.getElementById("taskCounter").textContent = "0";
            return;
        }

        data.forEach(t => {
            lista.innerHTML += `
            <li data-id="${t.id}" data-title="${t.title.toLowerCase()}">
                <span>
                    <strong>#${t.id}</strong> - ${t.title}
                    <br>
                    <small>👤 ${t.name}</small>
                </span>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarTarea(${t.id}, '${t.title.replace(/'/g, "\\'")}')">✏️ Editar</button>
                    <button class="btn-delete" onclick="eliminarTarea(${t.id})">🗑️ Eliminar</button>
                </div>
            </li>`;
        });
        
        document.getElementById("taskCounter").textContent = data.length;
    } catch (err) {
        console.error("Error al cargar tareas:", err);
        document.getElementById("taskCounter").textContent = "0";
    }
}

function filtrarTareas() {
    const texto = document.getElementById("buscarTarea").value.toLowerCase();
    const items = document.querySelectorAll("#listaTareas li[data-id]");
    
    let contador = 0;
    items.forEach(item => {
        const id = item.getAttribute("data-id");
        const titulo = item.getAttribute("data-title");
        const coincide = id.includes(texto) || titulo.includes(texto);
        item.style.display = coincide ? "flex" : "none";
        if (coincide) contador++;
    });
    
    if (contador === 0 && texto !== "") {
        items[0]?.parentElement.appendChild(
            Object.assign(document.createElement("li"), {
                className: "empty-message",
                textContent: "No se encontraron tareas",
                style: "display: none"
            })
        );
    }
}

async function editarTarea(id, actual) {
    const nuevo = prompt("📝 Editar el nombre de la tarea:\\n(Actual: " + actual + ")", actual);
    if (!nuevo || nuevo.trim() === "") return;

    try {
        const res = await fetch(`${API}/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: nuevo.trim() })
        });
        const data = await res.json();
        
        if (!res.ok) {
            return alert("❌ Error: " + (data.error || "No se pudo editar la tarea"));
        }
        
        console.log("✅ Tarea actualizada:", data);
        cargarTareas();
    } catch (err) {
        alert("❌ Error de conexión: " + err.message);
    }
}

async function eliminarTarea(id) {
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar esta tarea?")) return;
    
    try {
        const res = await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
        const data = await res.json();
        
        if (!res.ok) {
            return alert("❌ Error: " + (data.error || "No se pudo eliminar la tarea"));
        }
        
        console.log("✅ Tarea eliminada:", data);
        cargarTareas();
    } catch (err) {
        alert("❌ Error de conexión: " + err.message);
    }
}