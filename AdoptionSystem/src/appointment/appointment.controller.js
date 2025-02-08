import Appointment from "./appointment.model.js";
import Animal from "../animal/animal.model.js";
import User from "../user/user.model.js";

/**
 * @desc Crear una nueva cita
 * @route POST /api/appointments/
 * @access Private (Solo usuarios autenticados)
 */
export const addAppointment = async (req, res) => {
  try {
    const { date, animal, client, status } = req.body;
    const updateFields = {};

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Verificar si el animal existe antes de agregar
    if (animal !== undefined) {
      const existingAnimal = await User.findById(animal);
      if (!existingAnimal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      updateFields.animal = animal;
    }

    // Verificar si el client (usuario) existe antes de agregar
    if (client !== undefined) {
      const existingClient = await User.findById(client);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      updateFields.client = client;
    }

    // Validar que no exista una cita en la misma fecha
    const existingAppointment = await Appointment.findOne({
      date: appointmentDate,
    });
    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "An appointment already exists for this date" });
    }

    // Crear la nueva cita
    const newAppointment = new Appointment({
      date: appointmentDate,
      animal,
      client,
      status,
    });

    await newAppointment.save();
    res
      .status(201)
      .json({ message: "Appointment created successfully", newAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating appointment", error });
  }
};

/**
 * @desc Obtener todas las citas
 * @route GET /api/appointments/
 * @access Private
 */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("animal client");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointments", error });
  }
};

/**
 * @desc Obtener una cita por ID
 * @route GET /api/appointments/:id
 * @access Private
 */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "animal client"
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving appointment", error });
  }
};

/**
 * @desc Actualizar una cita
 * @route PUT /api/appointments/:id
 * @access Private
 */
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, animal, client } = req.body;
    const authUserId = req.user.id; // ID del usuario autenticado desde el token
    const authUserRole = req.user.role; // Rol del usuario autenticado

    // Buscar la cita
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validar permisos: Solo el dueño de la cita o un ADMIN puede modificarla
    if (
      authUserRole !== "ADMIN" &&
      appointment.client.toString() !== authUserId
    ) {
      return res.status(403).json({
        message: "Forbidden: You can only modify your own appointments",
      });
    }

    // Validaciones adicionales
    const updateFields = {};

    // Verificar si el animal existe antes de actualizar
    if (animal !== undefined) {
      const existingAnimal = await Animal.findById(animal);
      if (!existingAnimal) {
        return res.status(404).json({ message: "Animal not found" });
      }
      updateFields.animal = animal;
    }

    // Verificar si el client (usuario) existe antes de actualizar
    if (client !== undefined) {
      const existingClient = await User.findById(client);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      updateFields.client = client;
    }

    // Si se proporciona una nueva fecha, asegurarse de que no haya otra cita en esa fecha
    if (date !== undefined) {
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);

      const existingAppointment = await Appointment.findOne({
        date: appointmentDate,
      });
      if (existingAppointment && existingAppointment.id !== id) {
        return res
          .status(400)
          .json({ message: "An appointment already exists for this date" });
      }
      updateFields.date = appointmentDate;
    }

    // Si se proporciona un estado, validarlo
    if (status !== undefined) {
      if (!["pending", "confirmed", "completed", "canceled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updateFields.status = status;
    }

    // Si no hay campos válidos para actualizar, devolver error
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Actualizar la cita
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Appointment updated successfully",
      updatedAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

/**
 * @desc Eliminar una cita
 * @route DELETE /api/appointments/:id
 * @access Private
 */
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = req.user.id;
    const authUserRole = req.user.role;

    // Buscar la cita
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validar permisos: Solo el dueño de la cita o un ADMIN puede eliminarla
    if (
      authUserRole !== "ADMIN" &&
      appointment.client.toString() !== authUserId
    ) {
      return res.status(403).json({
        message: "Forbidden: You can only delete your own appointments",
      });
    }

    await appointment.deleteOne();
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error });
  }
};
