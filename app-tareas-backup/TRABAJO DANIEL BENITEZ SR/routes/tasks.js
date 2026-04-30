const express = require("express");
const router = express.Router();
const db = require("../database");

// Crear tarea
router.post("/", (req, res) => {
    const { title, user_id } = req.body;
    
    // Validar entrada
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "El título es requerido y debe ser texto" });
    }
    if (!user_id || !Number.isInteger(parseInt(user_id))) {
        return res.status(400).json({ error: "El ID de usuario es requerido y debe ser un número" });
    }
    
    const trimmedTitle = title.trim();
    const userId = parseInt(user_id);
    
    // Verificar que el usuario existe
    db.get("SELECT id FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
            console.error("Error al verificar usuario:", err.message);
            return res.status(500).json({ error: "Error al verificar usuario" });
        }
        if (!user) {
            return res.status(404).json({ error: "El usuario especificado no existe" });
        }
        
        db.run("INSERT INTO tasks(title, user_id) VALUES(?, ?)", [trimmedTitle, userId], function(err) {
            if (err) {
                console.error("Error al crear tarea:", err.message);
                return res.status(500).json({ error: "Error al crear tarea" });
            }
            res.status(201).json({ id: this.lastID, title: trimmedTitle, user_id: userId });
        });
    });
});

// Leer tareas con JOIN
router.get("/", (req, res) => {
    db.all("SELECT tasks.id, tasks.title, users.name FROM tasks JOIN users ON tasks.user_id = users.id ORDER BY tasks.id DESC", [], (err, rows) => {
        if (err) {
            console.error("Error al obtener tareas:", err.message);
            return res.status(500).json({ error: "Error al obtener tareas" });
        }
        res.json(rows || []);
    });
});

// Editar tarea
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    
    // Validar entrada
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "El título es requerido y debe ser texto" });
    }
    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: "ID de tarea inválido" });
    }
    
    const trimmedTitle = title.trim();
    const taskId = parseInt(id);
    
    db.run("UPDATE tasks SET title = ? WHERE id = ?", [trimmedTitle, taskId], function(err) {
        if (err) {
            console.error("Error al actualizar tarea:", err.message);
            return res.status(500).json({ error: "Error al actualizar tarea" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }
        res.json({ message: "Tarea actualizada", id: taskId, title: trimmedTitle });
    });
});

// Eliminar tarea
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    
    // Validar entrada
    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: "ID de tarea inválido" });
    }
    
    const taskId = parseInt(id);
    
    db.run("DELETE FROM tasks WHERE id = ?", [taskId], function(err) {
        if (err) {
            console.error("Error al eliminar tarea:", err.message);
            return res.status(500).json({ error: "Error al eliminar tarea" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }
        res.json({ message: "Tarea eliminada", id: taskId });
    });
});

module.exports = router;