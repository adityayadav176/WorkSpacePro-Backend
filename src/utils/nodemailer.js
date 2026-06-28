import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html,
    });
};

export {
    sendEmail,
    transporter
};