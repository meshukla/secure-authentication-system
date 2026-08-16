Secure Authentication System

This is a backend authentication system that I built using Node.js, Express.js and MongoDB.

I made this project mainly to understand how authentication works in a real backend instead of just using a ready-made authentication package. While building it, I worked with JWT, password hashing, email OTP verification, refresh tokens, sessions and password reset.

Features

- User registration
- Email verification using OTP
- User login
- Password hashing using bcrypt
- JWT access token
- JWT refresh token
- Refresh token rotation
- Session management
- Logout from current device
- Logout from all devices
- Forgot password using OTP
- Password reset
- HTTP-only cookies for tokens
- MongoDB database
- OTP expiry
- OTP stored as a hash instead of plain text
- Email sending using Brevo
- Custom HTML OTP email

Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Brevo
- Nodemailer
- Cookie Parser
- dotenv
- Redis (included as a dependency for future use)

How Authentication Works

When a new user registers, the password is hashed using bcrypt before it is stored in MongoDB.

After registration, an OTP is generated and sent to the user's email. The OTP is not stored directly in the database. Instead, I hash the OTP using SHA-256 and store the hash with an expiry time.

The user has to verify the OTP before being able to log in.

After login, the application creates an access token and a refresh token.

The access token is short-lived and is used for authentication. The refresh token lasts longer and is used to generate a new access token when the access token expires.

Both tokens are stored in HTTP-only cookies.

For refresh tokens, I also store their SHA-256 hash in the database along with the session information. When a refresh token is used, the old token hash is replaced with the hash of the new refresh token. This helps prevent an old refresh token from being reused.

Password Reset

The password reset flow also uses OTP.

1. User requests a password reset using their email.
2. A new OTP is generated.
3. The OTP is sent to the user's email.
4. The OTP is valid for 10 minutes.
5. After successful verification, the user can set a new password.
6. The password is hashed using bcrypt before saving it.
7. Existing sessions are removed after the password is changed.

API Routes

Method| Route| Purpose
POST| "/api/auth/register"| Create a new account
POST| "/api/auth/login"| Login user
GET| "/api/auth/refresh-token"| Generate new access and refresh tokens
GET| "/api/auth/get-me"| Get current user information
GET| "/api/auth/logout"| Logout from the current session
GET| "/api/auth/logout-all"| Logout from all sessions
POST| "/api/auth/verify-email"| Verify email using OTP
POST| "/api/auth/forgot-password"| Send password reset OTP
POST| "/api/auth/verify-forgot-password-otp"| Verify password reset OTP
POST| "/api/auth/reset-password"| Change password using OTP

Project Structure

secure-authentication-system/
│
├── server.js
├── package.json
├── README.md
│
└── src/
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
cd secure-authentication-system

Install the dependencies:

npm install

Environment Variables

Create a ".env" file in the root directory.

PORT=3000
MONGO_URI=your_mongodb_connection_string
jwt_secret=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_sender_email

Do not upload the ".env" file or expose your API keys and JWT secret publicly.

Run the Project

For development:

npm run dev

For normal start:

npm start

The server will start on the port defined in your ".env" file or port "3000" by default.

Email OTP

The project uses Brevo to send transactional emails.

I created a small utility function for generating the OTP and another function called "OtpHtml()" for creating the HTML content of the OTP email.

The OTP email contains:

- OTP code
- 10 minute expiry message
- Basic HTML styling
- Security warning not to share the OTP

What I Learned From This Project

While building this project, I learned more about:

- How JWT authentication works
- Difference between access and refresh tokens
- Refresh token rotation
- Storing sessions in MongoDB
- Password hashing with bcrypt
- OTP generation and verification
- Hashing sensitive temporary values
- HTTP-only cookies
- Password reset flow
- Sending emails from a backend
- Structuring an Express application
- Separating controllers, models, routes, services and utilities

This project is still something I am improving as I learn more about backend security and authentication.

Future Improvements

Some things I want to improve later:

- Add better request validation
- Add authentication middleware for protected routes
- Add more rate limiting around OTP and authentication endpoints
- Add Redis for session/OTP related use cases
- Add automated tests
- Improve error handling
- Add API documentation
- Add better security logging
- Improve the password reset and OTP flow further

Author

Meet Shukla

This project was built as a learning project to understand backend authentication and security in more depth.
