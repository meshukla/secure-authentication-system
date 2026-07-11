const monnoose = require('mongoose');

const otpSchema = new monnoose.Schema({

    email:{
        type:String,
        required:true
    },
    user:{
        type: monnoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otpHash:{
        type:String,
        required:true
    },
     purpose:{
        type:String,
        enum:[
            "email_verification",
            "forgot_password"
        ],
        required:true
    },

    expiresAt:{
        type:Date,
        required:true,
        expires:0
    }
},{
    timestamps:true
})
const OTP = monnoose.model('OTP', otpSchema);

module.exports = OTP;
