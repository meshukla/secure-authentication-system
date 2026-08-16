const { BrevoClient } = require("@getbrevo/brevo");
const config = require("../config/config");

const brevo = new BrevoClient({
    apiKey: config.BREVO_API_KEY,
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: "Your Authentication System",
                email: config.EMAIL_FROM,
            },

            to: [
                {
                    email: to,
                },
            ],

            subject: subject,

            textContent: text,

            htmlContent: html,
        });

        console.log("Email sent successfully:", response.messageId);

        return response;
    } catch (error) {
        console.error("Brevo email error:", error);
        throw error;
    }
};

module.exports = {
    sendEmail,
};