const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  // ID tự tăng
  id: {
    type: Number,
    unique: true
  },

  // Liên kết user (bây giờ là number)
  user_id: {
    type: Number,
    required: true,
    unique: true
  },

  full_name: {
    type: String,
    required: [true, 'Họ tên không được để trống'],
    trim: true
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true
  },

  phone: {
    type: String,
    trim: true
  },

  avatar_url: {
    type: String,
    trim: true
  },

  hire_date: {
    type: Date
  },

  status: {
    type: String,
    enum: ['active', 'suspended', 'resigned'],
    default: 'active'
  },

  notes: {
    type: String
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


// ============================
// AUTO INCREMENT ID
// ============================

// Tự động sinh id tăng dần khi tạo mới
StaffSchema.pre('save', async function () {
  if (!this.isNew) {
    return;
  }

  const lastUser = await this.constructor.findOne()
    .sort({ id: -1 })
    .select('id')
    .lean();

  this.id = lastUser && lastUser.id ? lastUser.id + 1 : 2000;
});


// ============================
// LIST STAFF
// ============================

StaffSchema.statics.listStaff = async function(filters = {}) {

  const query = {};

  if (filters.status) query.status = filters.status;

  if (filters.search) {
    query.$or = [
      { full_name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.find(query)
      .sort({ id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    this.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};


// ============================
// CREATE STAFF
// ============================

StaffSchema.statics.createStaff = async function(data) {

  if (!data.user_id) {
    throw new Error('user_id là bắt buộc');
  }

  if (!data.full_name) {
    throw new Error('full_name là bắt buộc');
  }

  const exist = await this.findOne({ user_id: data.user_id });

  if (exist) {
    throw new Error('User đã có staff');
  }

  const staff = new this({
    user_id: data.user_id,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    hire_date: data.hire_date,
    notes: data.notes
  });

  await staff.save();

  return staff;
};


// ============================
// UPDATE STAFF
// ============================

StaffSchema.statics.updateStaff = async function(id, data) {

  const staff = await this.findOne({ id });

  if (!staff) {
    throw new Error('Không tìm thấy nhân viên');
  }

  const allowed = [
    'full_name',
    'email',
    'phone',
    'avatar_url',
    'hire_date',
    'status',
    'notes'
  ];

  allowed.forEach(field => {
    if (data[field] !== undefined) {
      staff[field] = data[field];
    }
  });

  await staff.save();

  return staff;
};


// ============================
// DELETE STAFF (SOFT)
// ============================

StaffSchema.statics.deleteStaff = async function(id) {

  const staff = await this.findOne({ id });

  if (!staff) {
    throw new Error('Không tìm thấy nhân viên');
  }

  staff.status = 'resigned';

  await staff.save();

  return {
    success: true,
    message: 'Nhân viên đã nghỉ việc'
  };
};


// ============================
// HARD DELETE
// ============================

StaffSchema.statics.hardDeleteStaff = async function(id) {

  const staff = await this.findOneAndDelete({ id });

  if (!staff) {
    throw new Error('Không tìm thấy nhân viên');
  }

  return {
    success: true,
    message: 'Đã xóa nhân viên'
  };
};

const Staff = mongoose.model('Staff', StaffSchema);

module.exports = { Staff };