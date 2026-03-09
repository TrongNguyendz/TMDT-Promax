const validator = require("email-validator");
const dns = require("dns").promises;

const verifyEmailExists = async (email) => {

  // kiểm tra format
  if (!validator.validate(email)) {
    return { valid: false, reason: "Email không đúng định dạng" };
  }

  const domain = email.split("@")[1];

  try {

    // kiểm tra MX record
    const mxRecords = await dns.resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: "Domain email không tồn tại" };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, reason: "Không tìm thấy domain email" };
  }
};

module.exports = {
  verifyEmailExists
};