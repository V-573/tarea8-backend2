import { EventResponseDTO } from '../dtos/event.res.dto.js';
import { eventService } from '../services/event.service.js';


// Función del controlador getEvents para pasar req.query al servicio y retornar la estructura de respuesta requerida.
export const getEvents = async (req, res, next) => {
  try {
    const result = await eventService.getAllEvents(req.query);

    res.status(200).json({
      status: 'success',
      data: EventResponseDTO.list(result.data), // Transformar array de eventos
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages
    });
  } catch (error) {
    next(error);
  }
};


export const getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventById(eventId);
    res.status(200).json({ status: 'success',payload: new EventResponseDTO(event)});
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    // req.user proviene del middleware passportCall('jwt')
    const userId = req.user.id;
    const newEvent = await eventService.createEvent(req.body, userId);
    res.status(201).json({ status: 'success', payload: new EventResponseDTO(newEvent) });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Si el middleware isEventOwnerOrAdmin guardó req.event, se pasa al servicio
    const updatedEvent = await eventService.updateEvent(eventId, req.body, req.event);
    
    res.status(200).json({ 
      status: 'success', 
      payload: new EventResponseDTO(updatedEvent)
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Se reutiliza req.event para validar el estado antes de cancelar
    const cancelledEvent = await eventService.cancelEvent(eventId, req.event);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Evento cancelado exitosamente', 
      payload: new EventResponseDTO(cancelledEvent)
    });
  } catch (error) {
    next(error);
  }
};