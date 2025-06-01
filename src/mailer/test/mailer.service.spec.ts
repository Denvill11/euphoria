import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '../mailer.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailerService', () => {
  let service: MailerService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationCode', () => {
    const mockEmail = 'test@example.com';
    const mockCode = '123456';
    const mockName = 'John Doe';

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should send verification email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue(true);

      await service.sendVerificationCode(mockEmail, mockCode, mockName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Euphoria" <euphoria-mail@mail.ru>',
        to: mockEmail,
        subject: 'Ваш код подтверждения',
        text: `Ваш код: ${mockCode}`,
        html: expect.stringContaining(mockCode),
      });
      expect(console.log).toHaveBeenCalledWith('Письмо отправлено');
    });

    it('should send verification email without name', async () => {
      mockTransporter.sendMail.mockResolvedValue(true);

      await service.sendVerificationCode(mockEmail, mockCode);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Euphoria" <euphoria-mail@mail.ru>',
        to: mockEmail,
        subject: 'Ваш код подтверждения',
        text: `Ваш код: ${mockCode}`,
        html: expect.stringContaining(mockCode),
      });
      expect(console.log).toHaveBeenCalledWith('Письмо отправлено');
    });

    it('should handle email sending error', async () => {
      const error = new Error('Failed to send email');
      mockTransporter.sendMail.mockRejectedValue(error);

      await service.sendVerificationCode(mockEmail, mockCode, mockName);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Ошибка при отправке:', error);
    });

    it('should create transporter with correct config', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.mail.ru',
        secure: true,
        port: 465,
        auth: {
          user: process.env.EMAILER_USER,
          pass: process.env.EMAILER_PASSWORD,
        },
      });
    });
  });
}); 