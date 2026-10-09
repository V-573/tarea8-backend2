import nodemailer from 'nodemailer';

// Crear el transportador reutilizable usando las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465, // true para puerto 465, false para otros
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Envía un correo electrónico de confirmación de ticket
 */
export const sendTicketConfirmationEmail = async ({ to, userName, eventTitle, eventDate, eventLocation, reservationCode, quantity }) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: `Confirmación de inscripción - ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c3e50; text-align: center;">¡Inscripción Confirmada! 🎉</h2>
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Tu inscripción para el evento <strong>${eventTitle}</strong> ha sido procesada con éxito.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Código de Reserva:</strong> <span style="color: #e74c3c; font-weight: bold;">${reservationCode}</span></p>
            <p style="margin: 5px 0;"><strong>Fecha del Evento:</strong> ${eventDate}</p>
            <p style="margin: 5px 0;"><strong>Lugar:</strong> ${eventLocation}</p>
            <p style="margin: 5px 0;"><strong>Entradas reservadas:</strong> ${quantity}</p>
          </div>

          <p style="font-size: 0.9em; color: #7f8c8d;">Presenta tu código de reserva el día del evento al ingresar.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #95a5a6; text-align: center;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Correo enviado a ${to} (MessageID: ${info.messageId})`);
    return info;
  } catch (error) {
    // Registramos el error sin detener la respuesta principal si falla el email
    console.error('[Mailer Error] No se pudo enviar el correo de confirmación:', error.message);
  }
};