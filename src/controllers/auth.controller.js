const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sessionModel = require('../models/session.model');
const crypto = require('crypto');
const sendEmail = require('../services/email.service');
const { generateOtp, OtpHtml } = require('../utils/utils.js');
const OTP = require('../models/otp.model');
const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict"
};

async function userRegister(req, res) {
    try {
        const { username, email, password } = req.body;

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const otp = await generateOtp();

        const otpHtmlContent = await OtpHtml(otp);

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        await OTP.create({
            email: user.email,
            user: user._id,
            otpHash,
            purpose: "email_verification",
            expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
            )
        });

        await sendEmail.sendEmail(
            user.email,
            "Verify your email",
            "",
            otpHtmlContent
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function userLogin(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email }]
        }).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.verified) {
            return res.status(400).json({
                message: "User Not Verified"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const sessionId = new mongoose.Types.ObjectId();

        const refreshToken = jwt.sign(
            {
                id: user._id,
                sessionId: sessionId.toString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        const refreshTokenhash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        await sessionModel.create({
            _id: sessionId,
            user: user._id,
            refreshTokenhash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: sessionId.toString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        res.cookie(
            "accessToken",
            accessToken,
            {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000
            }
        );

        res.cookie(
            "refreshToken",
            refreshToken,
            {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        );

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function refreshtoken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token required"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired refresh token"
            });
        }

        if (!decoded.id || !decoded.sessionId) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        const refreshTokenhash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const newRefreshToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: decoded.sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        const newRefreshTokenhash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        const updatedSession = await sessionModel.findOneAndUpdate(
            {
                _id: decoded.sessionId,
                user: decoded.id,
                refreshTokenhash,
                revoked: false
            },
            {
                $set: {
                    refreshTokenhash: newRefreshTokenhash
                }
            },
            {
                new: true
            }
        );

        if (!updatedSession) {
            return res.status(401).json({
                message: "Refresh token already used or session revoked"
            });
        }

        const newAccessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: decoded.sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        res.cookie(
            "accessToken",
            newAccessToken,
            {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000
            }
        );

        res.cookie(
            "refreshToken",
            newRefreshToken,
            {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        );

        return res.status(200).json({
            message: "Access token refreshed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getme(req, res) {
    try {
        return res.status(200).json({
            message: "User data retrieved successfully",
            user: req.user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(200).json({
                message: "User already logged out"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(200).json({
                message: "User already logged out"
            });
        }

        const refreshTokenhash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await sessionModel.findOneAndUpdate(
            {
                _id: decoded.sessionId,
                user: decoded.id,
                refreshTokenhash,
                revoked: false
            },
            {
                $set: {
                    revoked: true
                }
            },
            {
                new: true
            }
        );

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        if (!session) {
            return res.status(200).json({
                message: "User already logged out"
            });
        }

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function logoutAll(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(401).json({
                message: "Refresh token required"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!decoded.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        await sessionModel.updateMany(
            {
                user: decoded.id,
                revoked: false
            },
            {
                $set: {
                    revoked: true
                }
            }
        );

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            message: "Logged out from all devices successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const otpdoc = await OTP.findOne({
            email,
            otpHash,
            purpose: "email_verification",
            expiresAt: {
                $gt: new Date()
            }
        });

        if (!otpdoc) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const user = await User.findByIdAndUpdate(
            otpdoc.user,
            {
                verified: true
            },
            {
                new: true
            }
        );

        await OTP.deleteMany({
            user: otpdoc.user
        });

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: true
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await OTP.deleteMany({
            user: user._id,
            purpose: "forgot_password"
        });

        const otp = await generateOtp();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        await OTP.create({
            email: user.email,
            user: user._id,
            otpHash,
            purpose: "forgot_password",
            expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
            )
        });

        const otpHtmlContent = await OtpHtml(otp);

        await sendEmail.sendEmail(
            user.email,
            "Reset Password OTP",
            "",
            otpHtmlContent
        );

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const otpDoc = await OTP.findOne({
            email,
            otpHash,
            purpose: "forgot_password",
            expiresAt: {
                $gt: new Date()
            }
        });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        return res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

async function resetPassword(req, res) {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const otpDoc = await OTP.findOne({
            email,
            otpHash,
            purpose: "forgot_password",
            expiresAt: {
                $gt: new Date()
            }
        });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await User.findByIdAndUpdate(
            otpDoc.user,
            {
                password: hashedPassword
            }
        );

        await sessionModel.deleteMany({
            user: otpDoc.user
        });

        await OTP.deleteMany({
            user: otpDoc.user,
            purpose: "forgot_password"
        });

        return res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    userRegister,
    userLogin,
    refreshtoken,
    getme,
    logout,
    logoutAll,
    verifyEmail,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword
};