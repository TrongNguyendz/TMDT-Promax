const bcrypt = require('bcryptjs');

const hashPassword = (plain) => bcrypt.hash(plain, 10);

const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);


const generateTempPassword = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase()
    .padEnd(length, '0').substring(0, length);
  // Hoặc đơn giản hơn:
  // return Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
};

module.exports = {
  hashPassword,
  comparePassword,
  generateTempPassword

};


