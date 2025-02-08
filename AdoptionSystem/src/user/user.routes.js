import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, updatePassword } from "./user.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";
import { updatePasswordValidator } from "../../middlewares/validators.js";

const api = Router()

// Rutas públicas (No autenticación necesaria)
api.get("/", getUsers); // Obtener todos los usuarios
api.get("/:id", getUserById); // Obtener usuario por ID

// Rutas protegidas (Requiere autenticación)
api.post("/", createUser); // Crear usuario
api.put("/:id", updateUser); // Actualizar usuario
api.delete("/:id", deleteUser); // Eliminar usuario

// Ruta protegida para actualizar contraseña con validaciones
api.put("/:id/password", validateJWT, updatePasswordValidator, updatePassword);
export default api
