import { ticketRepository } from '../repositories/ticket.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { CustomError } from '../utils/customError.util.js';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { sendTicketConfirmationEmail } from '../utils/mailer.util.js';

class TicketService {
  /**
   * Helper interno para validar fecha/hora pasada
   */
  #isPastDate(date, time = '00:00') {
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime < new Date();
  }

  /**
   * Genera un código de reservación único (ej: TCK-A1B2C3D4)
   */
  #generateReservationCode() {
    return `TCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async createTicket(eventId, userId, quantity = 1) {
    // 1. Validar que la cantidad solicitada sea válida
    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || !Number.isInteger(parsedQuantity)) {
      throw new CustomError('La cantidad debe ser un número entero mayor a 0', 400);
    }

    // 2. Validar que el evento exista
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new CustomError('El evento especificado no existe', 404);
    }

    // 3. Validar estado del evento (debe estar 'published')
    if (event.status !== 'published') {
      throw new CustomError(`No es posible comprar tickets para un evento en estado '${event.status}'`, 400);
    }

    // 4. Validar que el evento no haya finalizado por fecha/hora
    if (this.#isPastDate(event.date, event.time)) {
      throw new CustomError('El evento ya ha finalizado, no se permiten nuevas inscripciones', 400);
    }

    // 5. Validar que el usuario no tenga ya un ticket activo para este evento
    const existingTicket = await ticketRepository.findActiveByUserAndEvent(userId, eventId);
    if (existingTicket) {
      throw new CustomError('Ya posees una inscripción activa para este evento', 409);
    }

    // 6. Validar cupos disponibles (solo tickets con status activo consumen cupo)
    const occupiedSlots = await ticketRepository.getOccupiedSlots(eventId);
    const availableSlots = event.capacity - occupiedSlots;

    if (availableSlots < parsedQuantity) {
      throw new CustomError(
        `Cupos insuficientes. Cupos disponibles: ${availableSlots}, solicitados: ${parsedQuantity}`,
        400
      );
    }

    // 7. Generar e insertar el ticket
    const reservationCode = this.#generateReservationCode();

    const newTicket = await ticketRepository.createTicket({
      event: eventId,
      user: userId,
      quantity: parsedQuantity,
      reservationCode,
      status: 'confirmed'
    });

// 8. Enviar correo de confirmación (asíncrono)
    try {
      const user = await userRepository.getById(userId); // Obtener datos del usuario si req.user no tiene todo el objeto
      
      if (user && user.email) {
        sendTicketConfirmationEmail({
          to: user.email,
          userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Usuario',
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          reservationCode: newTicket.reservationCode,
          quantity: newTicket.quantity
        });
      }
    } catch (mailErr) {
      console.error('[TicketService] Error al intentar enviar email de confirmación:', mailErr.message);
    }

    return newTicket;
  }

  async cancelTicket(ticketId, user) {
    const ticket = await ticketRepository.getById(ticketId);

    // 1. Validar existencia del ticket
    if (!ticket) {
      throw new CustomError('El ticket especificado no existe', 404);
    }

    // 2. Validar que no esté cancelado ya
    if (ticket.status === 'cancelled') {
      throw new CustomError('El ticket ya se encuentra cancelado', 400);
    }

    // 3. Validar pertenencia o rol admin (El dueño o Admin pueden cancelar)
    const isOwner = ticket.user.toString() === user.id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new CustomError('No tienes permisos para cancelar este ticket', 403);
    }

    // 4. Cancelar ticket (automáticamente liberará el cupo al no contarse en el cálculo)
    return await ticketRepository.cancelTicket(ticketId);
  }

  async getMyTickets(userId) {
    return await ticketRepository.getTicketsByUser(userId);
  }

  async getEventTickets(eventId, requestingUser) {
    const event = await eventRepository.getEventById(eventId);
    if (!event) {
      throw new CustomError('El evento especificado no existe', 404);
    }

    // Validar autorización: Solo el organizador del evento o un Admin pueden ver los tickets del evento
    const isOrganizer = event.organizer.toString() === requestingUser.id.toString();
    const isAdmin = requestingUser.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      throw new CustomError('No tienes autorización para consultar los tickets de este evento', 403);
    }

    return await ticketRepository.getTicketsByEvent(eventId);
  }
}

export const ticketService = new TicketService();