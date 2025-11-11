import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarBienvenida = async (
  email: string,
  matricula: string,
  nombreCompleto: string
): Promise<boolean> => {
  try {
    const universidad = process.env.UNIVERSIDAD_NOMBRE || 'Universidad';
    const mailOptions = {
      from: `"${universidad}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎓 ¡Bienvenido a la Universidad!',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
              .header { background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .matricula { background-color: #f0f8ff; padding: 15px; border-left: 4px solid #003366; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header"><h1>¡Registro Exitoso!</h1></div>
              <p>Hola <strong>${nombreCompleto}</strong>, tu registro se completó exitosamente.</p>
              <div class="matricula">
                <strong>Matrícula:</strong>
                <h2>${matricula}</h2>
              </div>
              <p>Bienvenido a <strong>${universidad}</strong>.</p>
              <div class="footer">
                <p>${universidad}</p>
                <p>Este es un correo automático, por favor no responder.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};
