const nodemailer = require("nodemailer");

async function sendContactEmail({ email }) {
  const ownerEmail = process.env.OWNER_EMAIL;
  const appEmail = process.env.APP_EMAIL;
  const appPassword = process.env.APP_PASSWORD;

  if (!ownerEmail || !appEmail || !appPassword) {
    throw new Error("Email configuration is missing in environment variables");
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Change this based on your SMTP provider
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: appEmail,
      pass: appPassword,
    },
  });

  // Email content
  const mailOptions = {
    from: `"MAKTSON GROUP" <${appEmail}>`,
    to: ownerEmail,
    subject: "New Contact Interest - MAKTSON GROUP",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
              color: #0B0F19;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              letter-spacing: 0.3em;
              font-weight: 300;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #D4AF37;
              margin-top: 0;
              font-size: 22px;
              font-weight: 400;
            }
            .info-box {
              background: #f9f9f9;
              border-left: 4px solid #D4AF37;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-label {
              font-weight: 600;
              color: #555;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.1em;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 16px;
              color: #0B0F19;
              word-break: break-all;
            }
            .footer {
              background: #0B0F19;
              color: #aaa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
            }
            .footer a {
              color: #D4AF37;
              text-decoration: none;
            }
            .cta-button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #D4AF37, #F4D03F);
              color: #0B0F19;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAKTSON GROUP</h1>
            </div>
            <div class="content">
              <h2>🎯 New Contact Interest</h2>
              <p>Someone has expressed interest in getting in touch with MAKTSON GROUP.</p>

              <div class="info-box">
                <div class="info-label">Email Address</div>
                <div class="info-value">${email}</div>
              </div>

              <div class="info-box">
                <div class="info-label">Received At</div>
                <div class="info-value">${new Date().toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long',
                  timeZone: 'Asia/Kolkata'
                })}</div>
              </div>

              <p style="margin-top: 30px;">
                <strong>Next Steps:</strong><br>
                Please reach out to this potential client at your earliest convenience to discuss their interest in MAKTSON GROUP services.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your MAKTSON GROUP website contact form.</p>
              <p>© ${new Date().getFullYear()} MAKTSON GROUP. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New Contact Interest - MAKTSON GROUP

      Someone has expressed interest in getting in touch.

      Email Address: ${email}
      Received At: ${new Date().toLocaleString()}

      Please reach out to this potential client at your earliest convenience.

      ---
      This is an automated notification from your MAKTSON GROUP website.
    `,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  return {
    success: true,
    messageId: info.messageId,
    email,
  };
}

module.exports = sendContactEmail;
