const dotenv = require("dotenv");

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
}

if (!process.env.jwt_secret) {
    throw new Error("jwt_secret is not defined");
}

if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not defined");
}

if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not defined");
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.jwt_secret,

    BREVO_API_KEY: process.env.BREVO_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
};

module.exports = config;