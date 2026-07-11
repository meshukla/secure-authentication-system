 async function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
 async function OtpHtml(otp) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>

<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">

  <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#4f46e5; padding:20px; text-align:center; color:#fff;">
      <h2 style="margin:0;">OTP Verification</h2>
    </div>

    <!-- Body -->
    <div style="padding:30px; text-align:center;">

      <p style="font-size:16px; color:#333;">
        Use the OTP below to verify your account
      </p>

      <div style="margin:25px 0;">
        <span style="
          display:inline-block;
          font-size:28px;
          letter-spacing:8px;
          font-weight:bold;
          background:#f3f4f6;
          padding:12px 25px;
          border-radius:8px;
          color:#111;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px; color:#666;">
        This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.
      </p>


    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888;">
      © ${new Date().getFullYear()} Aunthentication System. All rights reserved.
    </div>

  </div>

</body>
</html>
`;
}

module.exports = { generateOtp, OtpHtml }