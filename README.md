Secure Authentication System

A backend authentication system built with Node.js, Express.js and MongoDB.

I built this project to understand how authentication works in a backend application and to practice things like JWT, refresh tokens, sessions, OTP verification, password hashing and password reset.

The project is currently deployed as a backend API on Render.

Live Backend

Base URL:

https://secure-authentication-system-n8na.onrender.com

This project does not have a frontend yet. The API can be tested using tools like Postman.

Features

- User registration
- Email verification using OTP
- User login
- Password hashing using bcrypt
- JWT access tokens
- JWT refresh tokens
- Refresh token rotation
- Session management
- Logout from current session
- Logout from all sessions
- Forgot password
- Password reset using OTP
- HTTP-only cookies
- MongoDB database
- OTP expiry
- Hashed OTP storage
- Email sending using Brevo
- Custom HTML OTP email

Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Brevo
- cookie-parser
- dotenv
- express-rate-limit
- Nodemailer

Authentication Flow

1. Register

A user can create an account using their username, email and password.

Before storing the password in MongoDB, it is hashed using bcrypt.

After registration, an OTP is generated and sent to the user's email for verification.

2. Email Verification

The user enters the OTP received by email.

The OTP is stored in the database as a hash and has an expiry time.

After successful verification, the user's account is marked as verified.

3. Login

After the email is verified, the user can log in using their email and password.

If the credentials are correct, the server creates:

- Access token
- Refresh token
- Session

The tokens are sent using HTTP-only cookies.

4. Refresh Token

The access token is short-lived.

When the access token expires, the refresh token can be used to create a new access token.

The refresh token is rotated when it is used, so the old refresh token cannot simply be reused.

The hash of the refresh token is stored in the session collection.

5. Logout

The user can logout from the current session.

There is also an option to logout from all sessions/devices.

6. Forgot Password

If a user forgets their password, they can request a password reset using their email.

A new OTP is sent to the email.

After verifying the OTP, the user can set a new password.

API Endpoints

All authentication routes start with:

/api/auth

Authentication

Method| Endpoint| Description
POST| "/api/auth/register"| Register a new user
POST| "/api/auth/login"| Login
POST| "/api/auth/verify-email"| Verify email using OTP
GET| "/api/auth/get-me"| Get current user
GET| "/api/auth/refresh-token"| Refresh access token
GET| "/api/auth/logout"| Logout current session
GET| "/api/auth/logout-all"| Logout from all sessions

Password Reset

Method| Endpoint| Description
POST| "/api/auth/forgot-password"| Request password reset OTP
POST| "/api/auth/verify-forgot-password-otp"| Verify password reset OTP
POST| "/api/auth/reset-password"| Reset password

Example API URL

For example, the login endpoint is:

https://secure-authentication-system-n8na.onrender.com/api/auth/login

Example request:

{
  "email": "example@gmail.com",
  "password": "your-password"
}

The API can be tested through Postman.

OTP Email

I created an "OtpHtml()" utility that generates the HTML content for the OTP email.

The OTP email contains:

- OTP code
- 10 minute expiry information
- Basic HTML styling
- Message telling the user not to share the OTP

Emails are sent using the Brevo transactional email API.

Database

MongoDB is used as the database.

There are three main models:

User

Stores user information such as:

- Username
- Email
- Password hash
- Verification status

Session

Stores information related to logged-in sessions, including:

- User
- Refresh token hash
- IP address
- User agent
- Revoked status

OTP

Stores OTP information including:

- Email
- User
- OTP hash
- OTP purpose
- Expiry time

Project Structure

secure-authentication-system/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
│
└── src/
    │
    ├── app.js
    │
    ├── config/
    │   └── config.js
    │
    ├── controllers/
    │   └── auth.controller.js
    │
    ├── db/
    │   └── db.js
    │
    ├── models/
    │   ├── user.model.js
    │   ├── session.model.js
    │   └── otp.model.js
    │
    ├── routes/
    │   └── auth.routes.js
    │
    ├── services/
    │   └── email.service.js
    │
    └── utils/
        └── utils.js

Installation

Clone the repository:

git clone https://github.com/meshukla/secure-authentication-system.git

Move into the project:

cd secure-authentication-system

Install dependencies:

npm install

Environment Variables

Create a ".env" file in the root directory.

PORT=3000
MONGO_URI=your_mongodb_connection_string
jwt_secret=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email

Do not upload your ".env" file to GitHub.

Run Locally

For development:

npm run dev

For production:

npm start

The server will run on:

http://localhost:3000

unless another port is provided through the "PORT" environment variable.

Deployment

The backend is deployed on Render.

Live API:

https://secure-authentication-system-n8na.onrender.com

The deployment currently contains only the backend API. A frontend has not been added yet.

What I Learned

While building this project, I learned more about:

- JWT authentication
- Access and refresh tokens
- Refresh token rotation
- Session management
- Password hashing
- OTP generation and verification
- Storing OTPs securely
- HTTP-only cookies
- Password reset flow
- Sending transactional emails
- MongoDB and Mongoose
- Express.js project structure
- Backend deployment

Future Improvements

I want to improve this project further by adding:

- Use Redis for OTP storage and expiry
- Add Google OAuth2 login
- Build a frontend for the authentication system
- Add authentication middleware for protected routes
- Improve overall security
- Add better rate limiting for authentication and OTP endpoints
Author

Meet Shukla

I built this project as a backend learning project to understand authentication and security concepts by implementing them myself.
