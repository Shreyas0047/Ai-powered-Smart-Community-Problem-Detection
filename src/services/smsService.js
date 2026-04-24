const env = require("../config/env");

async function sendOtpSms({ mobileNumber, otpCode }) {
  if (env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber) {
    const body = new URLSearchParams({
      To: mobileNumber,
      From: env.twilioFromNumber,
      Body: `Your AI Smart Community registration OTP is ${otpCode}. It is valid for 5 minutes.`
    });

    const authToken = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authToken}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "OTP SMS delivery failed.");
    }

    return { delivered: true, provider: "twilio" };
  }

  if (env.allowDemoOtp) {
    return { delivered: false, provider: "demo" };
  }

  throw new Error(
    "OTP SMS delivery is not configured. Add Twilio credentials or enable ALLOW_DEMO_OTP for demo mode."
  );
}

module.exports = {
  sendOtpSms
};
