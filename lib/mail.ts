import nodemailer from "nodemailer"

export async function sendMail({
    to,
    name,
    subject,
    body,
}: {
    to: string
    name: string
    subject: string
    body: string
}) {
    const { SMTP_EMAIL, SMTP_PASSWORD } = process.env
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: SMTP_EMAIL,
            pass: SMTP_PASSWORD,
        },
    })
    try {
        const connect = await transport.verify()
        console.log("Server is ready to take our messages", connect)
    } catch (error) {
        console.error("Error sending email:", error)
    }

    try {
        const result = await transport.sendMail({
            from: `Chatbot <${SMTP_EMAIL}>`,
            to,
            subject,
            html: body,
        })
        console.log("Email sent successfully:", result)
    } catch (error) {
        console.error("Error sending email:", error)
    }
}
