// src/dtos/user.res.dto.js

export class UserResponseDTO {
  constructor(user) {
    this.id = user._id ? user._id.toString() : user.id;
    this.firstName = user.first_name || '';
    this.lastName = user.last_name || '';
    this.fullName = `${this.firstName} ${this.lastName}`.trim() || 'Usuario';
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }

  /**
   * Helper estático para transformar un arreglo de usuarios
   */
  static list(users = []) {
    return users.map(user => new UserResponseDTO(user));
  }
}