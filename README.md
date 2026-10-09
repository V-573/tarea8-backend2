### Tarea8-backend2- implementacion de DTOS

La arquitectura en capas (Layered Architecture) es un patrón de diseño donde la aplicación se divide en niveles con responsabilidades claramente delimitadas. La regla de oro es el flujo unidireccional y jerárquico: una capa superior solo consume servicios de la capa inmediatamente inferior, asegurando desacoplamiento, facilidad de pruebas y mantenimiento.

## Responsabilidades por Capa

### 1. DTO (Data Transfer Object)
Responsabilidad: No forma parte de la lógica activa, sino que actúa como contrato de datos para limpiar, validar y formatear lo que entra (req.body, req.params) y sale (res.json).

En el sistema:

* User: UserResponseDTO remueve la contraseña y añade fullName.

* Event: EventResponseDTO estructura la información del organizador populado.

* Ticket: TicketResponseDTO expone reservationCode, estado y los datos resumidos del evento/usuario.

### 2. Controller (Capa de Controladores)
Responsabilidad: Recibir peticiones HTTP (req), llamar al servicio correspondiente enviando los datos limpios (Input DTO) y retornar respuestas JSON estructuradas (res) formateadas con Output DTOs. No debe contener reglas de negocio ni consultas a la BD.

En el sistema:

* user.controller.js: Recibe solicitudes de registro/login, manipula cookies JWT y envía respuestas con UserResponseDTO.

* event.controller.js: Captura parámetros de paginación (req.query) o IDs (req.params) y los deriva a eventService.

* ticket.controller.js: Extrae req.user.id, valida parámetros de ruta (eid, tid) y responde tras procesar compras o cancelaciones.

### 3. Service (Capa de Servicios)
Responsabilidad: Orquestar la lógica de negocio, validaciones operativas, flujos de seguridad y efectos secundarios (ej: envío de correos). Es el "cerebro" de la aplicación.

En el sistema:

* user.service.js: Aplica el hashing de contraseñas, valida unicidad de credenciales e integra la lógica de autenticación.

* event.service.js: Verifica disponibilidad de fechas/horarios en ubicaciones (findByLocationAndSchedule) para evitar cruces antes de publicar un evento.

* ticket.service.js:

Valida que la fecha/hora del evento no haya pasado (#isPastDate).

Genera de forma atómica el código único (#generateReservationCode).

Comprueba la disponibilidad de cupos calculando capacity - occupiedSlots.

Dispara el envío de correo de confirmación con Nodemailer.

### 4. Repository (Capa de Repositorios)
Responsabilidad: Actuar como intermediario entre la capa de negocio (Service) y la persistencia (DAO). Abstrae la fuente de datos para que, si en el futuro cambias de base de datos (ej: de MongoDB a PostgreSQL), la capa de servicios no sufra cambios.

En el sistema:

* user.repository.js: Solicita al DAO la búsqueda de usuarios por email o ID.

* event.repository.js: Sirve las consultas de eventos aplicando filtros de estado o paginación.

* ticket.repository.js: Expone métodos como getOccupiedSlots() o findActiveByUserAndEvent().

### 5. DAO (Data Access Object)
Responsabilidad: Realizar operaciones directas contra la base de datos a través de los modelos ORM/ODM (Mongoose). Aquí viven las consultas específicas (find, aggregate, populate, lean).

En el sistema:

* user.dao.js: Ejecuta UserModel.find({}, '-password').lean().

* event.dao.js: Maneja agregaciones/poblados directos como .populate('organizer', 'first_name last_name email').

* ticket.dao.js: Corre la canalización de agregación (aggregate) para sumar cupos ocupados ($sum: '$quantity') de tickets activos (status: { $in: ['confirmed', 'pending'] }).

### 6. Model (Capa de Modelo/Esquema)
Responsabilidad: Definir la estructura física, tipos de datos, restricciones de validación nativas e índices a nivel de base de datos.

En el sistema:

* user.model.js: Define tipos de campos, unicidad de email y enums de roles (['admin', 'organizer', 'user']).

* event.model.js: Define capacidades mínimas, precios y estados del evento.

* ticket.model.js: Define referencias (ref: 'events', ref: 'User') e índices compuestos parciales para impedir que un usuario compre múltiples tickets activos para un mismo evento.


## Flujo Complejo de Ejemplo: Comprar un Ticket

```
1. CLIENTE ────── HTTP POST /api/events/:eid/tickets ─────► CONTROLLER
                                                               │ (Instancia Input DTO)
2. SERVICE ◄───── ticketService.createTicket(eid, userId) ─────┘
    │
    ├──► eventRepository.getEventById(eid)  ──► DAO ──► BD
    ├──► Validaciones de negocio (Estado 'published', fecha no pasada, cupo disponible)
    ├──► ticketRepository.createTicket(...) ──► DAO ──► BD
    └──► sendTicketConfirmationEmail(...)   ──► Mailer
    │
3. CONTROLLER ◄── Devuelve el documento creado
    │ (Convierte con TicketResponseDTO)
    ▼
4. CLIENTE ◄───── 201 Created (JSON limpio sin metadatos de BD)
```