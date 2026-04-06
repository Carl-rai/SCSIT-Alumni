declare module "nodemailer" {
  type MailOptions = {
    from?: string;
    to?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
  };

  type Transporter = {
    sendMail(mailOptions: MailOptions): Promise<unknown>;
  };

  type TransportOptions = {
    service?: string;
    auth?: {
      user?: string;
      pass?: string;
    };
  };

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}
