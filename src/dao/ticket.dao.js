import { ticketModel } from '../models/ticket.model.js';
import mongoose from 'mongoose';

class TicketDAO {
  async create(ticketData) {
    // return await ticketModel.create(ticketData);
const newTicket = await ticketModel.create(ticketData);
  return newTicket.toObject(); // Convierte de Mongoose Document a POJO


  }

  async getById(id) {
    return await ticketModel.findById(id);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return await ticketModel.findOne({
      user: userId,
      event: eventId,
      status: { $ne: 'cancelled' }
    });
  }

   // Cuenta la suma total de 'quantity' en tickets activos (confirmed y pending)
  async countOccupiedSlots(eventId) {
    // 2. Convertir eventId a ObjectId explícitamente
    const objectId = typeof eventId === 'string' ? new mongoose.Types.ObjectId(eventId) : eventId;

    const result = await ticketModel.aggregate([
      {
        $match: {
          event: objectId, // 3. Usar el ObjectId convertido
          status: { $in: ['confirmed', 'pending'] }
        }
      },
      {
        $group: {
          _id: null,
          totalReserved: { $sum: '$quantity' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalReserved : 0;
  }

  async getTicketsByUser(userId) {
    return await ticketModel.find({ user: userId })
      .populate({
        path: 'event',
        select: 'title date location time price status'
      })
      .lean();
  }

  async getTicketsByEvent(eventId) {
    return await ticketModel.find({ event: eventId })
      .populate({
        path: 'user',
        select: 'first_name last_name email'
      })
      .lean();
  }

  async cancelTicket(ticketId) {


    return await ticketModel.findByIdAndUpdate(
      ticketId,
      {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    ).lean();// Retorna un POJO
  }
}

export const ticketDAO = new TicketDAO();