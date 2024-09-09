import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = (to, subject, text) => {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });
};

export default sendEmail;
