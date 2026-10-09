# TAREA7 - BACKEND2 - Módulo de Tickets y Notificaciones por Correo

Este módulo gestiona la interacción entre usuarios y eventos a través de inscripciones y reservas (Tickets), aplicando la separación de responsabilidades para mantener la integridad de la logística del evento y el control preciso de la capacidad disponible.

## 📋 Estados del Ticket

Cada ticket pasa por un ciclo de vida definido por los siguientes estados:

| Estado | Descripción | ¿Consume Cupo? |
| :--- | :--- | :--- | 
| confirmed | Inscripción confirmada y activa para el evento. | Sí |
| pending | Reserva en proceso de pago/confirmación. | Sí |
| cancelled | Ticket cancelado por el usuario o administrador. | No |

## ⚙️ Reglas de Negocio y Control de Cupos

Unicidad de Inscripción: Un usuario solo puede tener un ticket activo (confirmed o pending) por evento. No se permiten registros duplicados.

Cálculo de Cupos Disponibles:


$$\text{Cupos Disponibles} = \text{capacidadTotalDelEvento} - \sum \text{quantity (tickets activos)}$$

Liberación Automática de Cupos: Al cancelar un ticket (status: 'cancelled'), la cantidad de cupos asociada se descuenta inmediatamente del conteo de cupos ocupados, quedando disponible para otros usuarios.

Validación de Evento Activo: No es posible inscribirse a eventos con estado draft o con fecha/hora previa al momento actual.

## 🔄 Flujo de Inscripción

[ Usuario ] ---> POST /api/tickets/events/:eid
                     │
                     ├── 1. Validar existencia y estado del evento ('published')
                     ├── 2. Verificar que el evento no haya expirado por fecha/hora
                     ├── 3. Consultar si el usuario ya tiene un ticket activo (409 Conflict)
                     ├── 4. Calcular cupos ocupados vía Agregación MongoDB ($match + $group)
                     ├── 5. Validar disponible >= solicitados (400 Bad Request si no hay cupo)
                     ├── 6. Generar código único de reserva (ej: TCK-A1B2C3D4) y guardar Ticket
                     └── 7. Disparar servicio de Nodemailer para correo de confirmación


### 🚀 Rutas de la API (/api/tickets)

| Método | Ruta | Autorización | Descripción |
| :--- | :--- | :--- | :--- | 
| POST | /api/events/:eid/tickets | Authenticated | Crea una inscripción para el evento :eid. Body opcional: { "quantity": 1 }. | 
| GET | /api/tickets/my-tickets | Authenticated | Retorna la lista de tickets del usuario autenticado con el evento poblado (populate). | 
| GET | /api/events/:eid/tickets | Organizer / Admin | Obtiene todos los tickets registrados para el evento :eid. | 
| PATCH | /api/tickets/:tid/cancel | Owner / Admin | Cancela el ticket :tid y libera los cupos en la base de datos. | 

## 📧 Configuración de Correo Electrónico (Nodemailer)

El servicio utiliza Nodemailer para enviar confirmaciones automáticas vía SMTP.

Variables de Entorno Requeridas (.env)

# Configuración de Nodemailer / Email Service


* MAIL_HOST=smtp.gmail.com
* MAIL_PORT=587
* MAIL_USER=tu_correo@gmail.com
* MAIL_PASS=abcdefghijklmnop
* MAIL_FROM="Eventos App <tu_correo@gmail.com>"



### Configuración con Gmail (App Passwords)

Activa la Verificación en dos pasos en tu cuenta de Google.

Ve a Contraseñas de aplicaciones.

Genera un nuevo código para "Aplicación personalizada" (ej. Eventos API).

Asigna los 16 caracteres generados a la variable MAIL_PASS en tu archivo .env.

📄 Archivo de Ejemplo .env.example

PORT=8080
MONGODB_URI=mongodb://localhost:27017/eventos

# Mailer Configuration
* MAIL_HOST=
* MAIL_PORT=
* MAIL_USER=
* MAIL_PASS=
* MAIL_FROM=
