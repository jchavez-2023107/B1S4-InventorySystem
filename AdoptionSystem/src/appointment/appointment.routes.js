import { Router } from "express";
import {
  addAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "./appointment.controller.js";
import { validateJWT } from "../../middlewares/validate.jwt.js";

const api = Router();

api.post("/", validateJWT, addAppointment);
api.get("/", validateJWT, getAppointments);
api.get("/:id", validateJWT, getAppointmentById);
api.put("/:id", validateJWT, updateAppointment);
api.delete("/:id", validateJWT, deleteAppointment);

export default api;
