const crypto = require('crypto');

const generateTransactionId = () => {
  const random = crypto.randomBytes(4).toString('hex');
  return `TXN-${Date.now()}-${random}`;
};

const generateCouponCode = (prefix = 'SAVE') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
};

module.exports = {
  generateTransactionId,
  generateCouponCode
};


