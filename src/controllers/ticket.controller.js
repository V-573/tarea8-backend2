import { CreateTicketInputDTO } from '../dtos/ticket.req.dto.js';
import { TicketResponseDTO } from '../dtos/ticket.res.dto.js';
import { ticketService } from '../services/ticket.service.js';

export const createTicket = async (req, res, next) => {
  try {
  //   const { eid } = req.params;
  //   const userId = req.user.id;
  //   const { quantity } = req.body;

  //   const newTicket = await ticketService.createTicket(eid, userId, quantity || 1);

  //   res.status(201).json({
  //     status: 'success',
  //     message: 'Inscripción realizada exitosamente',
  //     payload: newTicket
  //   });

  // 1. Normalizar entrada con Input DTO
    const ticketInput = new CreateTicketInputDTO({
      eventId: req.params.eid,
      userId: req.user.id,
      quantity: req.body.quantity
    });

    // 2. Invocar el servicio con los datos limpios
    const newTicket = await ticketService.createTicket(
      ticketInput.eventId,
      ticketInput.userId,
      ticketInput.quantity
    );

    // 3. Formatear la salida con Output DTO
    res.status(201).json({
      status: 'success',
      message: 'Inscripción realizada exitosamente',
      payload: new TicketResponseDTO(newTicket)
    });

  } catch (error) {
    next(error);



  }
};

export const getMyTickets = async (req, res, next) => {
  try {

    
    // const userId = req.user.id;
    // const tickets = await ticketService.getMyTickets(userId);

    // res.status(200).json({
    //   status: 'success',
    //   payload: tickets
    // });


const userId = req.user.id;
    const tickets = await ticketService.getMyTickets(userId);

    // Mapear el array a Output DTOs
    res.status(200).json({
      status: 'success',
      payload: TicketResponseDTO.list(tickets)
    });

  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  try {
    // const { eid } = req.params;
    // const tickets = await ticketService.getEventTickets(eid, req.user);

    // res.status(200).json({
    //   status: 'success',
    //   payload: tickets
    // });


   const { eid } = req.params;
    const tickets = await ticketService.getEventTickets(eid, req.user);

    res.status(200).json({
      status: 'success',
      payload: TicketResponseDTO.list(tickets)
    }); 

  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    // const { tid } = req.params;
    // const cancelledTicket = await ticketService.cancelTicket(tid, req.user);

    // res.status(200).json({
    //   status: 'success',
    //   message: 'Ticket cancelado exitosamente',
    //   payload: cancelledTicket
    // });

    const { tid } = req.params;
    const cancelledTicket = await ticketService.cancelTicket(tid, req.user);

    res.status(200).json({
      status: 'success',
      message: 'Ticket cancelado exitosamente',
      payload: new TicketResponseDTO(cancelledTicket)
    });
  } catch (error) {
    next(error);
  }
};