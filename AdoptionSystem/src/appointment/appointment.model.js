import { Schema, model } from "mongoose";

const appointmentSchema = Schema(
    {
        date: {
            type: Date,
            required: [true, 'Date is required'],
            unique: true // Evita más de una cita por día
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'canceled'],
            default: 'pending'
        },
        animal: {
            type: Schema.Types.ObjectId,
            ref: 'Animal',
            required: [true, 'Animal is required'],
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Client is required'],
        }
    },
    { timestamps: true }
);

// Exportar el modelo
export default model('Appointment', appointmentSchema);
