const passwordResetOTPTemplate = (otp) => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Password Reset</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.08);">

<tr>
<td style="background:#2563eb;padding:25px;text-align:center;">
<h1 style="color:#fff;margin:0;">Workspace Pro</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2>Password Reset Request</h2>

<p>Hello,</p>

<p>
We received a request to reset your password.
Use the OTP below to continue.
</p>

<div style="text-align:center;margin:35px 0;">
<span style="
display:inline-block;
padding:16px 35px;
font-size:34px;
font-weight:bold;
letter-spacing:8px;
background:#eef4ff;
color:#2563eb;
border:2px dashed #2563eb;
border-radius:10px;
">
${otp}
</span>
</div>

<p>
This OTP is valid for <strong>10 minutes</strong>.
</p>

<p>
Never share this OTP with anyone.
</p>

<hr>

<p style="color:#666;">
If you didn't request this password reset, simply ignore this email.
</p>

</td>
</tr>

<tr>
<td style="background:#f8fafc;padding:20px;text-align:center;color:#777;font-size:13px;">
© ${new Date().getFullYear()} Workspace Pro
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

export {
    passwordResetOTPTemplate
}