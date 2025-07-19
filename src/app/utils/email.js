
import nodemailer from 'nodemailer';



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to, link) {
  const mailOptions = {
    from: `"Luloy" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p>If you did not request a password reset, please ignore this email or contact us if you have any concerns.</p>
        <p>Thanks,<br>The Luloy Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
