import {Schema, model} from 'mongoose';

const ticketCollection = 'tickets';

const ticketSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'events',
    required: [true, 'El evento es obligatorio']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  status: {
    type: String,
    enum: {
      values: ['confirmed', 'pending', 'cancelled'],
      message: '{VALUE} no es un estado de ticket válido'
    },
    default: 'confirmed'
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad mínima es 1']
  },
  reservationCode: {
    type: String,
    required: [true, 'El código de reservación es obligatorio'],
    unique: true
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índice para asegurar que un usuario solo tenga un ticket activo por evento
ticketSchema.index(
  { event: 1, user: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } } }
);

export const ticketModel = model(ticketCollection, ticketSchema);