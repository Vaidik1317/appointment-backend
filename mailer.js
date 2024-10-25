const nodemailer = require("nodemailer");

// Create a transporter object using your SMTP configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Gmail or your preferred email service
  auth: {
    user: "221243107010.ce@gmail.com", // Your email
    pass: "bilimora123", // App-specific password or email password
  },
});

// Define the sendEmail function
const sendEmail = (emailData) => {
  const mailOptions = {
    from: "221243107010.ce@gmail.com",
    to: emailData.to,
    subject: emailData.subject,
    text: emailData.text,
  };

  return transporter.sendMail(mailOptions);
};

// Export the sendEmail function
module.exports = sendEmail;
