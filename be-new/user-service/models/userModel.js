const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    unique: true,
    // Không cần required: true vì pre-save hook sẽ gán giá trị
  },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  avatar_url: { type: String },
  role: { type: String, default: 'customer', enum: ['customer', 'admin', 'staff'] },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'banned'] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  temp_password: { type: String },
  temp_password_expires: { type: Date },
  verification_otp: { type: String, default: null },
  verification_otp_expires: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 👇[CHANGE] THÊM ĐOẠN NÀY VÀO ĐỂ LÀM SẠCH DỮ LIỆU TRẢ VỀ 👇
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // Ẩn trường __v
  transform: function (doc, ret) {
    delete ret._id;  // Ẩn trường _id gốc của Mongo, chỉ giữ lại 'id' số của bạn
  }
});
// 👆 HẾT PHẦN THÊM 👆

// Index
UserSchema.index({ id: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// Tự động sinh id tăng dần khi tạo mới
UserSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const lastUser = await this.constructor.findOne()
      .sort({ id: -1 })
      .select('id')
      .lean();

    this.id = lastUser && lastUser.id ? lastUser.id + 1 : 1000;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', UserSchema);

// ────────────────────────────────────────────────
// Helper functions
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const { 
    password_hash, 
    temp_password, 
    temp_password_expires,
    verification_otp,
    verification_otp_expires,
    ...safe 
  } = obj;
  return safe;
};
exports.sanitizeUser = sanitizeUser;

exports.findById = async (id) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return User.findOne({ id: numericId });
};

exports.findByEmail = async (email) =>
  User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

exports.findByUsername = async (username) =>
  User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

exports.findByEmailWithTemp = exports.findByEmail; // giữ tương thích

exports.listUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or =[
      { full_name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    data: data.map(sanitizeUser),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

exports.createUser = async (payload) => {
  const user = new User(payload);
  await user.save();
  return user;
};

exports.updateUser = async (id, payload) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return User.findOneAndUpdate(
    { id: numericId },
    { $set: { ...payload, updated_at: Date.now() } },
    { new: true, lean: true }
  );
};

exports.deleteUser = async (id) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return false;
  const result = await User.findOneAndDelete({ id: numericId });
  return !!result;
};

exports.updateRole = async (id, role) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  return User.findOneAndUpdate(
    { id: numericId },
    { role, updated_at: Date.now() },
    { new: true }
  );
};

exports.setTempPassword = async (userId, tempPassword, expiresInMinutes = 30) => {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  return User.findOneAndUpdate(
    { id: numericId },
    { temp_password: tempPassword, temp_password_expires: expiresAt, updated_at: Date.now() },
    { new: true }
  );
};

exports.clearTempPassword = async (userId) => {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;
  return User.findOneAndUpdate(
    { id: numericId },
    { temp_password: null, temp_password_expires: null, updated_at: Date.now() },
    { new: true }
  );
};

exports.createStaff = async (payload) => {
  const staffData = {
    ...payload,
    role: 'staff', // ép role luôn là staff
  };

  const user = new User(staffData);
  await user.save();
  return user;
};

// ==================== EMAIL VERIFICATION OTP ====================

// Tạo OTP 6 số
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 100000 - 999999
};

// Lưu OTP vào user
exports.setVerificationOTP = async (userId, otp, expiresInMinutes = 15) => {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;

  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return User.findOneAndUpdate(
    { id: numericId },
    { 
      verification_otp: otp, 
      verification_otp_expires: expiresAt,
      status: 'inactive'
    },
    { new: true }
  );
};

// Xác thực OTP và kích hoạt tài khoản
exports.verifyOTP = async (email, otp) => {
  if (!email || !otp) return null;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    verification_otp: otp,
    verification_otp_expires: { $gt: new Date() }
  });

  if (!user) return null;

  // Kích hoạt tài khoản
  const updatedUser = await User.findOneAndUpdate(
    { id: user.id },
    { 
      status: 'active',
      verification_otp: null,
      verification_otp_expires: null,
      updated_at: Date.now()
    },
    { new: true }
  );

  return updatedUser;
};

// Gửi lại OTP
exports.resendOTP = async (userId) => {
  const numericId = Number(userId);
  if (isNaN(numericId)) return null;

  const user = await User.findOne({ id: numericId });
  if (!user || user.status === 'active') return null;

  const newOtp = exports.generateOTP();
  await exports.setVerificationOTP(user.id, newOtp, 15);

  return { user, otp: newOtp };
};