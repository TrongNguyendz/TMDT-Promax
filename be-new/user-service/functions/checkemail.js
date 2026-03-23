const validator = require("email-validator");

const verifyEmailExists = async (email) => {
  if (!validator.validate(email)) {
    return { valid: false, reason: "Email không đúng định dạng" };
  }

  return { valid: true };  // ← Thêm dòng này để luôn return object
};

module.exports = {
  verifyEmailExists
};