# Secure Authentication System

A backend authentication system built with Node.js, Express.js and MongoDB.

I built this project to understand how authentication works in a real backend application, including JWT authentication, sessions, OTP verification, password reset and refresh token rotation.

## Features

- User registration and login
- Email verification using OTP
- JWT authentication
- Access token and refresh token
- Refresh token rotation
- Session management
- Logout from current device
- Logout from all devices
- Forgot password and password reset
- Password hashing using bcrypt
- HTTP-only cookies
- MongoDB database
- Email sending using Nodemailer

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Nodemailer

## Authentication

The application uses two tokens:

- **Access Token** – short-lived token used for authentication.
- **Refresh Token** – used to generate a new access token after it expires.

Refresh tokens are stored in HTTP-only cookies and their hashes are stored in the database. Refresh token rotation is also implemented to prevent reuse of old refresh tokens.

## Main Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/auth/get-me` | Get current user |
| GET | `/api/auth/logout` | Logout |
| GET | `/api/auth/logout-all` | Logout from all devices |
| POST | `/api/auth/verify-email` | Verify email using OTP |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/verify-forgot-password-otp` | Verify reset OTP |
| POST | `/api/auth/reset-password` | Reset password |

## Installation

Clone the repository:

```bash
git clone https://github.com/meshukla/secure-authentication-system.git
cd secure-authentication-system
npm install