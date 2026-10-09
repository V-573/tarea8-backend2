import { ticketDAO } from '../dao/ticket.dao.js';

class TicketRepository {
  async createTicket(ticketData) {
    return await ticketDAO.create(ticketData);
  }

  async getById(id) {
    return await ticketDAO.getById(id);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return await ticketDAO.findActiveByUserAndEvent(userId, eventId);
  }

  async getOccupiedSlots(eventId) {
    return await ticketDAO.countOccupiedSlots(eventId);
  }

  async getTicketsByUser(userId) {
    return await ticketDAO.getTicketsByUser(userId);
  }

  async getTicketsByEvent(eventId) {
    return await ticketDAO.getTicketsByEvent(eventId);
  }

  async cancelTicket(ticketId) {
    return await ticketDAO.cancelTicket(ticketId);
  }
}

export const ticketRepository = new TicketRepository();

