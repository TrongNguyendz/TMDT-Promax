// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Tên không được để trống'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   age: {
//     type: Number,
//     min: 0,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// }, {
//   timestamps: true,          // tự động thêm createdAt, updatedAt
// });

// module.exports = mongoose.model('User', userSchema);
// // → collection trong MongoDB sẽ tên là → users (chữ thường + số nhiều)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
  temp_password_expires: { type: Date }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index để tìm nhanh
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });

const User = mongoose.model('User', UserSchema);

// ────────────────────────────────────────────────
// Helper functions (giữ nguyên logic cũ nhưng dùng Mongoose)
const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  const { password_hash, temp_password, temp_password_expires, ...safe } = obj;
  return safe;
};

exports.sanitizeUser = sanitizeUser;

exports.findById = async (id) => User.findById(id);

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
    query.$or = [
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
  return User.findByIdAndUpdate(
    id,
    { $set: { ...payload, updated_at: Date.now() } },
    { new: true, lean: true }
  );
};

exports.deleteUser = async (id) => {
  const result = await User.findByIdAndDelete(id);
  return !!result;
};

exports.updateRole = async (id, role) =>
  User.findByIdAndUpdate(id, { role, updated_at: Date.now() }, { new: true });

exports.setTempPassword = async (userId, tempPassword, expiresInMinutes = 30) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  return User.findByIdAndUpdate(
    userId,
    { temp_password: tempPassword, temp_password_expires: expiresAt, updated_at: Date.now() },
    { new: true }
  );
};

exports.clearTempPassword = async (userId) =>
  User.findByIdAndUpdate(
    userId,
    { temp_password: null, temp_password_expires: null, updated_at: Date.now() },
    { new: true }
  );