// src/dtos/ticket.res.dto.js

export class TicketResponseDTO {
  constructor(ticket) {
    this.id = ticket._id ? ticket._id.toString() : ticket.id;
    this.reservationCode = ticket.reservationCode;
    this.quantity = ticket.quantity;
    this.status = ticket.status;
    
    // Formato de fechas para la vista del cliente
    this.createdAt = ticket.createdAt;
    this.cancelledAt = ticket.cancelledAt || null;

    // Manejo seguro de 'event' si está populado o si es solo un ObjectId/String
    if (ticket.event && typeof ticket.event === 'object' && ticket.event._id) {
      this.event = {
        id: ticket.event._id.toString(),
        title: ticket.event.title,
        date: ticket.event.date,
        time: ticket.event.time,
        location: ticket.event.location,
        price: ticket.event.price,
        status: ticket.event.status
      };
    } else if (ticket.event) {
      this.event = ticket.event.toString();
    }

    // Manejo seguro de 'user' si está populado
    if (ticket.user && typeof ticket.user === 'object' && ticket.user._id) {
      this.user = {
        id: ticket.user._id.toString(),
        fullName: `${ticket.user.first_name || ''} ${ticket.user.last_name || ''}`.trim(),
        email: ticket.user.email
      };
    } else if (ticket.user) {
      this.user = ticket.user.toString();
    }
  }

  /**
   * Método estático helper para formatear arrays de tickets
   */
  static list(tickets) {
    return tickets.map(ticket => new TicketResponseDTO(ticket));
  }
}