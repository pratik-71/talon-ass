const nodemailer = require('nodemailer');

// Configure the transporter
// Note: You should fill these in your .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log('[EmailService] ⚡ SMTP Transporter Initialized:', {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false
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
            Start Verification
          </a>
        </div>

        <p style="color: #475569; font-size: 12px; margin-top: 30px;">
          This is an automated system notification from the Talon Platform HQ.<br>
          Verification is required before payout.
        </p>
      </div>
    `
  };

  console.log('[EmailService] 📧 Preparing to send winner notification...');
  console.log('[EmailService] 📍 Target:', winnerEmail);
  console.log('[EmailService] ⚙️ Config Check:', {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER ? 'EXISTS' : 'MISSING',
    pass: process.env.SMTP_PASS ? 'EXISTS' : 'MISSING'
  });

  try {
    // 1. Verify connection first
    console.log('[EmailService] 🔄 Verifying transporter connection...');
    await transporter.verify();
    console.log('[EmailService] ✅ SMTP Connection Verified. From:', process.env.SMTP_USER);

    // 2. Send the mail
    console.log('[EmailService] 📤 Sending mail via nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] ✨ Winner email sent successfully!');
    console.log('[EmailService] 🆔 Message ID:', info.messageId);
    console.log('[EmailService] 📨 Response:', info.response);
    return true;
  } catch (error) {
    console.error('[EmailService] ❌ CRITICAL EMAIL FAILURE:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });

    if (error.code === 'EAUTH') {
      console.error('[EmailService] 🔑 AUTHENTICATION ERROR: Check your SMTP_USER and SMTP_PASS (App Password).');
    } else if (error.code === 'ESOCKET') {
      console.error('[EmailService] 🌐 NETWORK ERROR: Check your SMTP_HOST and PORT. Firewall might be blocking port 587.');
    }

    return false;
  }
};
/**
 * Send Winner Status Update Email (Approved or Rejected)
 */
exports.sendStatusUpdateEmail = async (winnerEmail, winnerName, status, prizeAmount) => {
  const isApproved = status === 'paid';
  const mailOptions = {
    from: `"TALON PLATFORM" <${process.env.SMTP_USER}>`,
    to: winnerEmail,
    subject: isApproved ? '✅ PRIZE AUTHORIZED: Your Talon Payout is ready!' : '❌ ACTION REQUIRED: Prize Submission Issue',
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px; text-align: center; border-radius: 20px;">
        <div style="margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 40px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px;">TALON<span style="color: #ffffff;">.</span></h1>
        </div>
        
        <div style="background-color: #1e293b; padding: 40px; border-radius: 30px; border: 1px solid #334155; max-width: 500px; margin: 0 auto;">
          <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">Status Update, ${winnerName}</h2>
          <p style="color: #94a3b8; font-weight: 600; margin-bottom: 30px;">
            ${isApproved 
              ? 'Great news! Your prize verification has been approved and your payout has been authorized.' 
              : 'Your recent prize verification submission was rejected. Please review your scores and re-upload the correct proof.'}
          </p>
          
          <div style="background-color: #0f172a; padding: 20px; border-radius: 20px; margin-bottom: 30px;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin: 0 0 5px 0;">Payout Status</p>
            <p style="font-size: 18px; font-weight: 900; color: ${isApproved ? '#10b981' : '#f43f5e'}; margin: 0;">${isApproved ? 'AUTHORIZED' : 'REJECTED'}</p>
            <hr style="border: none; border-top: 1px solid #1e293b; margin: 15px 0;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #64748b; margin: 0 0 5px 0;">Prize Amount</p>
            <p style="font-size: 24px; font-weight: 900; margin: 0;">£${prizeAmount}</p>
          </div>

          <a href="${process.env.FRONTEND_URL}/profile" style="display: block; background-color: #10b981; color: #0f172a; padding: 20px; border-radius: 15px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
            View Dashboard
          </a>
        </div>

        <p style="color: #475569; font-size: 12px; margin-top: 30px;">
          This is an automated system notification from the Talon Platform HQ.
        </p>
      </div>
    `
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✨ Status update email sent (${status}) to ${winnerEmail}`);
    return true;
  } catch (error) {
    if (error.code === 'EAUTH') {
      console.error('[EmailService] 🔑 AUTHENTICATION ERROR: Check your SMTP_USER and SMTP_PASS (App Password) in Vercel/Env.');
    } else {
      console.error('[EmailService] ❌ Status update email failed:', error);
    }
    return false;
  }
};
