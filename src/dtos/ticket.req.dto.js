// src/dtos/ticket.req.dto.js

export class CreateTicketInputDTO {
  constructor({ eventId, userId, quantity }) {
    this.eventId = eventId ? String(eventId).trim() : null;
    this.userId = userId ? String(userId).trim() : null;
    // Forzar la conversión a entero y valor por defecto si no viene
    this.quantity = quantity ? parseInt(quantity, 10) : 1;
  }
}