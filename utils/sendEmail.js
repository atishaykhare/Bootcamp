const nodemailer = require("nodemailer");


const sendEMail = async (options = {}) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });


    const info = await transporter.sendMail({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.msg, // plain text body
    });

    console.log("Message sent: %s", info.messageId);

}


module.exports = sendEMail;
