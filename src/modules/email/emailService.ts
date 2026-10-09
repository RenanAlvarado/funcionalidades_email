import { Resend } from "resend";

class EmailService {
  async sendVerificationEmail(
    to: string,
    verificationLink: string,
  ): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error("Configure RESEND_API_KEY e EMAIL_FROM no ambiente.");
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Confirme seu endereço de e-mail",
      text: [
        "Olá!",
        "",
        "Recebemos seu cadastro.",
        "Para confirmar seu endereço de e-mail, acesse o link abaixo:",
        verificationLink,
        "",
        "Este link é temporário e expira em 30 minutos.",
        "Se você não realizou esse cadastro, ignore esta mensagem.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Confirme seu e-mail</h2>
          <p>Olá! Recebemos seu cadastro.</p>
          <p>Para confirmar seu endereço de e-mail, clique no botão abaixo:</p>
          <p>
            <a
              href="${verificationLink}"
              style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px;"
            >
              Confirmar e-mail
            </a>
          </p>
          <p>Este link é temporário e expira em 30 minutos.</p>
          <p>Se você não realizou esse cadastro, ignore esta mensagem.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erro retornado pelo Resend:", error);
      throw new Error("Não foi possível enviar o e-mail de confirmação.");
    }
  }
}

export default new EmailService();
