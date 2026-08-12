const { getEmailHealthSnapshot, sendRegistrationOtpEmail, verifySmtpConnection } = require("../src/services/emailService");

verifySmtpConnection()
  .then(async (result) => {
    const testArg = process.argv.find((arg) => arg.startsWith("--send-test="));
    const testEmail = testArg ? testArg.split("=").slice(1).join("=").trim() : "";
    let testResult = null;

    if (testEmail) {
      const sent = await sendRegistrationOtpEmail({
        email: testEmail,
        otp: "123456",
        username: "smtp-test"
      });
      testResult = {
        messageId: Boolean(sent.messageId),
        accepted: (sent.accepted || []).length,
        rejected: (sent.rejected || []).length
      };
    }

    console.log(
      JSON.stringify(
        {
          ok: result.ok,
          activeProvider: getEmailHealthSnapshot().provider,
          emailConfigured: getEmailHealthSnapshot().configured,
          host: result.host,
          port: result.port,
          secure: result.secure,
          family: result.family,
          fromConfigured: Boolean(result.from),
          testResult
        },
        null,
        2
      )
    );
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
