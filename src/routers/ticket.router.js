import { Router } from 'express';
import { passportCall } from '../middlewares/passportCustom.middleware.js'; // Ajusta la ruta a tu middleware de auth
import {
  createTicket,
  getMyTickets,
  getEventTickets,
  cancelTicket
} from '../controllers/ticket.controller.js';

const router = Router();

// POST /api/events/:eid/tickets -> Comprar/Inscribirse (Usuario Autenticado)
router.post('/events/:eid/tickets', passportCall('jwt'), createTicket);

// GET /api/tickets/my-tickets -> Mis tickets con populate del evento (Usuario Autenticado)
router.get('/tickets/my-tickets', passportCall('jwt'), getMyTickets);

// GET /api/events/:eid/tickets -> Tickets de un evento (Organizador del evento o Admin)
router.get('/events/:eid/tickets', passportCall('jwt'), getEventTickets);

// PATCH /api/tickets/:tid/cancel -> Cancelar un ticket (Dueño del ticket o Admin)
router.patch('/tickets/:tid/cancel', passportCall('jwt'), cancelTicket);

export default router;