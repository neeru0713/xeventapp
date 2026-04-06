import nodemailer from 'nodemailer'

const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

export const sendMail = async ({ to, subject, text, html }) => {
  if (!to) {
    return
  }

  if (!transporter) {
    console.log('Mail not sent because SMTP is not configured', { to, subject, text })
    return
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@xevents.local',
    to,
    subject,
    text,
    html,
  })
}
