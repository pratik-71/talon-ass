const nodemailer = require('nodemailer');

// Configure the transporter
// Note: You should fill these in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your app password
  },
});

/**
 * Send Winner Notification Email
 */
exports.sendWinnerEmail = async (winnerEmail, winnerName, prizeTier, amount, verificationLink) => {
  const mailOptions = {
    from: `"TALON PLATFORM" <${process.env.SMTP_USER}>`,
    to: winnerEmail,
    subject: '🏆 CONGRATULATIONS: You are a Talon Winner!',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px; text-align: center; border-radius: 20px;">
        <div style="margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 40px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px;">TALON<span style="color: #ffffff;">.</span></h1>
        </div>
        
        <div style="background-color: #1e293b; padding: 40px; border-radius: 30px; border: 1px solid #334155; max-width: 500px; margin: 0 auto;">
          <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">You've Won, ${winnerName}!</h2>
          <p style="color: #94a3b8; font-weight: 600; margin-bottom: 30px;">You have been selected as an official winner in this month's Digital Hero Draw.</p>
          
          <div style="background-color: #0f172a; padding: 20px; border-radius: 20px; margin-bottom: 30px;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin: 0 0 5px 0;">Prize Tier</p>
            <p style="font-size: 18px; font-weight: 900; color: #10b981; margin: 0;">${prizeTier}</p>
            <hr style="border: none; border-top: 1px solid #1e293b; margin: 15px 0;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin: 0 0 5px 0;">Winning Amount</p>
            <p style="font-size: 24px; font-weight: 900; margin: 0;">£${amount}</p>
          </div>

          <a href="${verificationLink}" style="display: block; background-color: #10b981; color: #0f172a; padding: 20px; border-radius: 15px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
            Claim Your Prize Now
          </a>
        </div>

        <p style="color: #475569; font-size: 12px; margin-top: 30px;">
          This is an automated system notification from the Talon Platform HQ.<br>
          Verification is required before payout.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Winner email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send failure detail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};
