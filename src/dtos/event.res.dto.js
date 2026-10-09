// src/dtos/event.res.dto.js

export class EventResponseDTO {
  constructor(event) {
    this.id = event._id ? event._id.toString() : event.id;
    this.title = event.title;
    this.description = event.description;
    this.category = event.category;
    this.location = event.location;
    this.date = event.date;
    this.time = event.time;
    this.capacity = event.capacity;
    this.price = event.price;
    this.status = event.status;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;

    // Manejo seguro del organizador (populado o ObjectId)
    if (event.organizer && typeof event.organizer === 'object' && event.organizer._id) {
      this.organizer = {
        id: event.organizer._id.toString(),
        fullName: `${event.organizer.first_name || ''} ${event.organizer.last_name || ''}`.trim(),
        email: event.organizer.email
      };
    } else if (event.organizer) {
      this.organizer = event.organizer.toString();
    } else {
      this.organizer = null;
    }
  }

  /**
   * Helper estático para formatear arreglos de eventos
   */
  static list(events = []) {
    return events.map(event => new EventResponseDTO(event));
  }
}