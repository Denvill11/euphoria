import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAILER_USER,
      pass: process.env.EMAILER_PASSWORD,
    },
  });

  async sendVerificationCode(toEmail: string, code: string, name?: string): Promise<void> {
    const mailOptions = {
      from: '"Euphoria" <euphoria-mail@mail.ru>',
      to: toEmail,
      subject: 'Ваш код подтверждения',
      text: `Ваш код: ${code}`,
      html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; background-color: #ffffff; color: #393939;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table width="700" cellpadding="20" cellspacing="0" border="0" style="max-width: 700px;">
                  <tr>
                    <td align="center">
                      <img src="https://82grrc2b-3001.euw.devtunnels.ms/uploads/verification.png" width="250" alt="Verification Image">
                    </td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500; text-align: center;">
                      Здравствуйте, ${name}!
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">
                      С использованием Вашей почты был отправлен запрос на регистрацию аккаунта на нашем сервисе Эйфория. Для завершения скопируйте код и вставьте в форму на сайте. Ваш код подтверждения:
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="background-color: #FF5333; color: #ffffff; padding: 20px; letter-spacing: 1px; font-weight: 500;">
                      ${code}
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">
                      Если Вы не запрашивали этот код, ничего делать не требуется.
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: center;">
                      С уважением,<br>Команда "Эйфория"
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Письмо отправлено');
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    }
  }
}
