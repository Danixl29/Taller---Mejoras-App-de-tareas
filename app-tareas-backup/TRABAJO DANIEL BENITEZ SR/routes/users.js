const express = require("express");
const router = express.Router();
const db = require("../database");

// Crear usuario
router.post("/", (req, res) => {
 const { name } = req.body;

 // Validar entrada
 if (!name || typeof name !== "string" || name.trim() === "") {
   return res.status(400).json({ error: "El nombre es requerido y debe ser texto" });
 }

 const trimmedName = name.trim();

 db.run("INSERT INTO users(name) VALUES(?)", [trimmedName], function(err) {
   if (err) {
     console.error("Error al crear usuario:", err.message);
     return res.status(500).json({ error: "Error al crear usuario" });
   }
   res.status(201).json({ id: this.lastID, name: trimmedName });
 });
});

// Obtener usuarios
router.get("/", (req, res) => {
 db.all("SELECT * FROM users", [], (err, rows) => {
   if (err) {
     console.error("Error al obtener usuarios:", err.message);
     return res.status(500).json({ error: "Error al obtener usuarios" });
   }
   res.json(rows || []);
 });
});

module.exports = router;
