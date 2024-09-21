import express from "express";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { readTasks, writeTasks } from "./utils/handleFile.js";
import { getUsers } from "./utils/handleUser.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

const SECRET_KEY = "esto_es_un_secreto";

// MIDDLEWARE:
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ message: 'Token requerido' });
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token no válido' });
      req.user = user;
      next();
    });
};

//________________________________________________________
//_______AUTH:
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
  
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  
    // Generar el token con el nombre de usuario en el payload
    // const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    const token = jwt.sign({ username: user.username }, SECRET_KEY);
    res.json({ token });
})

// Middleware tasks:
app.use('/tasks', authenticateToken);
//________________________________________________________
//____GET:
// All tasks:
app.get("/tasks", (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
})

// Task by ID:
app.get("/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if(!task) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        })
    }
    res.json(task);
})

//________________________________________________________
// POST:
// Create new task:
app.post('/tasks', (req, res) => {
    console.log(req.body);
    const tasks = readTasks();
    const newTask = {
      id: crypto.randomUUID(),
      text: req.body.text,
      isDone: req.body.isDone || false,
      priority: req.body.priority || 0,
    };
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

//________________________________________________________
// PUT:
// Update task:
app.put("/tasks/:id", (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    if(taskIndex === -1) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        })
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        text: req.body.text || tasks[taskIndex].text,
        isDone: req.body.isDone !== undefined ? req.body.isDone : tasks[taskIndex].isDone,
        priority: req.body.priority || tasks[taskIndex].priority,
    };

    writeTasks(tasks);
    res.json(tasks[taskIndex]);
})

//________________________________________________________
// DELETE:
app.delete("/tasks/:id", (req, res) => {   
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    if(taskIndex === -1) {
        return res.status(404).json({
            message: "Tarea no encontrada"
        })
    }
    tasks.splice(taskIndex, 1);
    writeTasks(tasks);
    res.sendStatus(204);
})


//________________________________________________________
//________________________________________________________
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})